//Extend js Array to provide function for multidimensional arrays 

Array.matrix = function(numrows, numcols, initial) {
    var arr = [];
    for (var i = 0; i < numrows; ++i) {
        var columns = [];
        for (var j = 0; j < numcols; ++j) {
            columns[j] = initial;
        }
        arr[i] = columns;
    }
    return arr;
}

$(document).ready(function(){
    //-----------------------------------------------------//
                       // SETUP //    
    //-----------------------------------------------------//
    var ROWS = 6;
    var COLUMNS = 4;
    var CSS_CLASS = ["zero", "one", "two", "three", "four", "five"];  //array to convert row/col numbers to/from css selectors 
    //var BOARD_STATES = ["block", "heart", "clear", "reinforced", "player"];
    var CSS_TILES = {"block":"resources/images/regularBlocks.png" , "heart":'resources/images/energyHearts.png', "clear":"resources/images/regularBlocks.png", "reinforced":"resources/images/reinforcedBlocks.png", "player":"resources/images/playerBlocks.png" };
    var playerTurn = true;
    var score = 0;
    var tool = 0;
    var victory=ROWS*COLUMNS;
    var energy = 24;
    var playerTile; //variable for storing location of player tile, initially off the board so undefined here
    var board = Array.matrix(ROWS, COLUMNS, "block");
    
    //-----------------------------------------------------//
                       // FUNCTIONS //    
    //-----------------------------------------------------//
    
    //Helper function to provide a random block from the board.
function random_block() {
        var ranRow = Math.floor(Math.random()*ROWS);
        var ranCol = Math.floor(Math.random()*COLUMNS);
        return [ranRow, ranCol];
    }
    
    //Helper function to add energy
function addEnergy(num){
    energy+=num;
    for(var i=0;i<num;i++){
        $(".energy").append('<img src="resources/images/energybarJellyBabes.png" alt="Picture of energy baby">');
    }
    $('.displayEnergy').text(energy);
}
    
    //Helper function to update tool count/display
function updateTool(){
     tool +=1;
     if(score===0) {tool--}; //when called by newGame, adjust tool count
     var nthTool= tool%4;
     if(nthTool===0){
        $(".tool li").removeClass("ion-hammer");        
     }
     else {
        $(".tool li:nth-child("+nthTool+")").addClass("ion-hammer");
     }
     $(".tool h1").text(Math.floor(tool/4));
} //End of updateTool function
    
    //Function to make and show legal moves
function makeMove(row, col){
        if(playerTurn){
            energy--;
            $(".energy img:first-child").remove();        
            score++;

            $(".score").text(score); 
                //adjust energy/energy display and tool/tool display
            switch(board[row][col]){
                case "reinforced":
                    energy--;
                    $(".energy img:first-child").remove();
                    updateTool();                
                    break;
                case "block":  
                    updateTool();
                    playSound("regular");
                    break;
                case "heart":
                    addEnergy(4);
                    alert("Don't you love it! Bonus energy awarded");
                    break;                    
                case "clear":
                    score-- //Subtract to counter normal addition              
            } //End switch block
        } //End if block
    
        //these two variables are adjusted for use with the 'nth-child' css selector
        var nth_col = col+1; 
        var player_col = playerTile[1]+1;
        $('.messages').text("You moved onto a "+board[row][col]+ " square");       
                
        
    $('.displayEnergy').text(energy);               
                
        //Clear the tile the player is coming from, after first turn  
        if(score>0){
            board[playerTile[0]][playerTile[1]]="clear";        
            $("."+CSS_CLASS[playerTile[0]]+" li:nth-child("+ player_col+") img").attr("src", CSS_TILES["clear"]);        
            $("."+CSS_CLASS[playerTile[0]]+" li:nth-child("+ player_col+")").addClass("clear");
        }
        
        //Store the tile state
        tileState = board[row][col];
        //Move the player
        board[row][col]="player"; 
        playerTile[0]=row;
        playerTile[1]=col;
        //update the display 
        $("."+CSS_CLASS[row]+" li:nth-child("+ nth_col+") img").attr("src", CSS_TILES["player"]);
        $("."+CSS_CLASS[row]+" li:nth-child("+ nth_col+") img").removeClass("clear");    
        
        if (score===12 & tileState!=="clear"){
            alert("You cleared 12 blocks! 2 Bonus energies!");
            addEnergy(2);            
        }
        if(score===victory&playerTurn===true){
            playSound("cheer");
            alert("Oh joy! You win!!!!!"); 
            playerTurn=false; 
        }
        else if(energy===0 & victory>=ROWS*COLUMNS &playerTurn===true){
            playSound("boo");
            alert("Drat and double drat! I'm sorry, you lose.");
            playerTurn=false; //so the message doesn't keep popping up after you lose
        }            
}   //End of makeMove function 
    
          
    
function newGame(){   
    playerTurn = true;
    score = 0;
    tool = 0;
    updateTool();//clear tool part display and update score
    $('body').removeClass('toolCursor'); // If they restarted while tool was in play
    victory = ROWS*COLUMNS; //reset for the victory message
    
    //Establish the board, with everything initially set to regular blocks.
    board = Array.matrix(ROWS, COLUMNS, "block");  
    $('.game li img').attr("src", "resources/images/regularBlocks.png");
    $('.game li').removeClass("clear");
    
    //Place random heart/energy tile on screen
    var energy_block = random_block();
    if (energy_block[0]>2){
        energy_block[0]-=3;  //Limit energy tile to top half of the board
    }
    var col_num = energy_block[1]+1;  //For use with nth-child pseudo-class
    board[energy_block[0]][energy_block[1]]="heart";    
    $("." + CSS_CLASS[energy_block[0]]+ " "+ "li:nth-child("+col_num+") img").attr('src', CSS_TILES["heart"]); 
    
    //Add as many energy bunnies as needed
    addEnergy(ROWS*COLUMNS-energy);
} // End of newGame function
    
function computerTurn(){
    var compMove = random_block();
    if(board[compMove[0]][compMove[1]]==="block"){
       playSound("reinforce");
       setTimeout(function(){
           stopSound("reinforce");
       },2000);
       board[compMove[0]][compMove[1]]="reinforced";
       var cssCol = compMove[1]+1; //Adjust col number for use with nth-child
       $(".compMove").text(compMove[0]+", "+compMove[1]);
       $("." + CSS_CLASS[compMove[0]]+ " "+ "li:nth-child("+cssCol+") img").attr('src', CSS_TILES["reinforced"]); 
        
    }
} //End of computerTurn function
    
    // --- Sound Functions --- //
function playSound(soundobj) {
    var thissound=document.getElementById(soundobj);
    if(soundobj==='backgroundMusic'){
        thissound.volume = 0.1;        
    }
    else{
        thissound.volume = 0.3;
    }    
    thissound.play();
}
function stopSound(soundobj) {
    var thissound=document.getElementById(soundobj);
    thissound.pause();
    thissound.currentTime = 0;
}

    
    
    
    //-----------------------------------------------------//
                    // EVENT HANDLERS //    
    //-----------------------------------------------------//
    
    //This function handles clicks on game tiles, presumptive moves
$('.game li').click(function(){
    //get location of selected square and convert to numbers
    var thisCSSRow = $(this).parent().attr('class');
    var thisCSSCol = $(this).attr('class').split(" ")[0];
    var thisRow = CSS_CLASS.indexOf(thisCSSRow);
    var thisCol = CSS_CLASS.indexOf(thisCSSCol);
    var thisTile = board[thisRow][thisCol];
    $('.messages').text("You clicked on: "+thisRow+",  "+thisCol);
    
    //Handle first turn separately
    if(score===0){
        if(thisRow===ROWS-1){
            playerTile = [thisRow, thisCol]; //playerTile first defined, used in makeMove
            makeMove(thisRow, thisCol);
            computerTurn();
            return;
        }
        else{
            alert("On the first turn, you may move to any square in the bottom row");
            return;
        }
    }     
    
    var moveVal = Math.abs(thisRow-playerTile[0])+Math.abs(thisCol-playerTile[1]); //Used to determine if tool use and move are legal
    
    //check to see if useTool class is in effect, handle appropriately
    if($('body').attr('class')){
        if(board[thisRow][thisCol]==="reinforced"&moveVal===1){
            board[thisRow][thisCol]="block";
            tool-=4;
            playSound('useTool');
            
            $(".useTool").text("Use Tool");
            var nthCol = thisCol+1;
            $("."+thisCSSRow+" li:nth-child("+ nthCol+") img").attr("src", "resources/images/regularBlocks.png");
            $('body').removeClass('toolCursor'); 
            $(".tool h1").text(Math.floor(tool/4));
            return;
        }  
        else if(moveVal>1){
            alert("Tool may only be used on an adjacent square");
        }
        else{
            alert("Use the tool on a reinforced square");
            return;
        }
    }
    //check if the move is legal and either make it or alert player why not    
    
    var energyNeeded = 1; //regular and clearblocks
    if(board[thisRow][thisCol]==="reinforced"){
        energyNeeded++
    }
    else if(board[thisRow][thisCol]==="heart" || playerTurn===false){
        energyNeeded--
    }    
    if(moveVal===1&energyNeeded<=energy){
        makeMove(thisRow, thisCol);
        computerTurn();
       }
    else if(energyNeeded>energy & victory>=COLUMNS*ROWS){alert("You do not have enough energy to make that move!")}
    else if(moveVal===0 & playerTurn===true){alert("Must move to a new tile!")}
    else if(victory<COLUMNS*ROWS) {
        //After game is over, this block allows player to move around board
        energy++;
        tool--;
        makeMove(thisRow, thisCol);
    }
    else{alert("You can only move one row up, down, left, or right.");}    
}); // End of $('.game li').click handler   

 
$(".useTool").click(function(){  
    var toolText = $('.useTool').text();
    if(tool>=4){
        $('body').attr('class')? $('body').removeClass('toolCursor') : $('body').addClass('toolCursor');
        toolText==="Use Tool" ? $(".useTool").text("Cancel") : $(".useTool").text("Use Tool");
        
    }    
    else{
        alert("You don't have a complete tool to use!");
    }
    
});
    

$('.newGame').click(function(){
    newGame();
});
    
//var music= setInterval(function(){
//    playSound('backgroundMusic');
//},10600);

$(".music").click(function(){
    var musicText = $(".music").text();
    alert(musicText);
    if (musicText==="Pause Music"){
      stopSound('backgroundMusic');
      clearInterval(music);
      $('.music').text("Start Music");
      alert("Music Paused");
    } 
    else{
        playSound('backgroundMusic');
        
        $('.music').text("Pause Music");
      alert("Music Resumed");
        
    }
    
})
    


newGame();    
    
    
    
}); /* End of document.ready() */