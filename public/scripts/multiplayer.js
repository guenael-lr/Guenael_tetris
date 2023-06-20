var socket = io();
const canvasPlayer = document.getElementById('gamePlayer');
const contextPlayer = canvasPlayer.getContext('2d');
const roomName= document.querySelector('.roomName'),
roomPlayers = document.querySelector('.roomPlayers'),
roomStatus = document.querySelector('.roomStatus');


const hold = document.getElementById('hold');
const contextHold = hold.getContext('2d');
const queue = document.getElementById('queue');
const contextQueue = queue.getContext('2d');
const grid = 32;
const tetrominoSequence = []; 
var holdright = false;

var ingame = false;

const tetrominos = {
  'I': [    
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  'J': [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  'L': [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  'O': [
    [1,1],
    [1,1],
  ],
  'S': [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  'Z': [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  'T': [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ]
};
// color of each tetromino
const colors = {
  'I': 'cyan',
  'O': 'yellow',
  'T': 'purple',
  'S': 'green',
  'Z': 'red',
  'J': 'blue',
  'L': 'orange',
  'G': 'grey',
  'B': 'black'
};

let count = 0;
var level = 0;
var score = 0;
var b2b = 0;
var combo = 0;
const scorelines = [0, 40, 100, 300, 1200];
let rAF = null;  // keep track of the animation frame so we can cancel it
let gameOver = false;
var scorep = document.getElementById('score');
var linesp = document.getElementById('line');
var levelp = document.getElementById('level');
var timep = document.getElementById('time');

var seconds = 0;
var counter = 0;
var countertimegame = 0;
let holding = 0;
var playfield = [];
var holdfield = [];
var queuefield = [];
var queueTetromino = [];
var lines = 0;
var maxtimetetro;

var contextAdversary = [];
for (n = 1; n < 10; n++){
  contextAdversary.push({'canvas': document.getElementById('adv' + n), 'context' : document.getElementById('adv' + n).getContext('2d')});
}
var playersinroom = [];
var playersalive = [];
var statusroom = "Waiting";
var mystatus = "Waiting";
var myplace = 0;

var interval;
function name(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const roomnumber = (window.location.search).substr(1);
socket.emit('connectMe', {"pseudo": me.pseudo,"nmbr":roomnumber});

socket.on('connectToRoom',function(data){ 
  if(buttonLobbyState){
    lobby.classList.add('display-none');
          divsmulti.forEach((element) => {
              element.classList.remove('display-none');
            });
          buttonLobbyState = false;
  }
    playersinroom = data.players;
    roomName.innerHTML = "Room : " + data.room;
    roomPlayers.innerHTML = "Players : ";
    playersinroom.forEach(element => {
      roomPlayers.innerHTML += element + "<br> ";
      if(element != me.pseudo){
        diplayName(element);
      }
    });
    statusroom = data.status;
    if(statusroom == "Playing"){
      myplace = data.players.indexOf(me.pseudo);
      mystatus = "Watching";
    }
    else{
      mystatus = "Waiting";
    }
    displayStatusPLayer(mystatus);
    roomStatus.innerHTML = "Status : " + data.status;
 });

socket.on('alert', (data) => {
  alert(data);
  sounds.alert.play();
});

socket.on('newplayer',function(data){
  if(data == me.pseudo){
    return;
  }
  sounds.new_player.play();
  if(playersinroom.indexOf(data) != -1 ){ return;};
  playersinroom.push(data)
  roomPlayers.innerHTML = "Players : ";
    playersinroom.forEach(element => {
      roomPlayers.innerHTML += element + "<br> ";
    });;
    diplayName(data);
});

socket.on('playerleft',function(data){
  var whereme = playersinroom.indexOf(me.pseudo)
  var wherehim = playersinroom.indexOf(data)
  var cont = contextAdversary[wherehim > whereme ? wherehim -1  : wherehim ].context;
  var canvas = contextAdversary[wherehim > whereme ? wherehim -1  : wherehim ].canvas;  playersinroom = playersinroom.filter((tmp) => tmp != data);
  cont.clearRect(0,0,canvas.width,canvas.height);
  roomPlayers.innerHTML = "Players : ";
    playersinroom.forEach(element => {
      roomPlayers.innerHTML += element + "<br> ";
    });;

    if(playersinroom.length == 1){
      socket.emit('statusRoom',"Waiting");
    }
  
});

socket.on('startGame',function(data){
  ingame = false;
  playersalive = [...playersinroom].filter((tmp) => tmp != me.pseudo);
  socket.emit('statusRoom',"Playing");
  clearInterval(counter);
  clearInterval(interval);
  clearInterval(countertimegame);
  seconds = 0;
  counter = 0;
  contextPlayer.clearRect(0,0,canvasPlayer.width,canvasPlayer.height);
  counterToStart();
  roomStatus.innerHTML = "Status : " + statusroom;  
});
socket.on('setStatusRoom',function(data){
  statusroom = data;
  roomStatus.innerHTML = "Status : " + statusroom;
});

function shuffle(array) {
  return array.sort((a, b) => 0.5 - Math.random());
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function greyLine(line){
  playfield.push(line);
  playfield.shift();
  tetromino.row--;
}
socket.on("getAttack",function(data){
  if(me.pseudo != data.pseudo){
    return;
  }
  else{
    var random = getRandomInt(0,1000);
    var line = ['G','G','G','G','G','G','G','G','G','G'];
    line[getRandomInt(0,9)] = '';
    if(random < 1){    
      for(let i = 0; i < data.attack; i++){
        greyLine(line)
      }
      sounds.attack2.play();
      return;
    }else if (random < 10){
      for (let i = 0; i < (data.attack > 3 ? 3 : data.attack); i++) {
        greyLine(line)
      }
      for (let i = 0; i < data.attack - 3; i++) {
        var tmp = ['G','G','G','G','G','G','G','G','G','G']
        tmp[getRandomInt(0,9)] = ''
        greyLine(tmp)
      }
      sounds.attack2.play();
      return;
    }else if (random < 100){
      for (let i = 0; i < (data.attack > 2 ? 2 : data.attack); i++) {
        greyLine(line)
      }
      for (let i = 0; i < data.attack - 2; i++) {
        var tmp = ['G','G','G','G','G','G','G','G','G','G']
        tmp[getRandomInt(0,9)] = ''
        greyLine(tmp)
      }
      sounds.attack1.play();
      return;
    }else{
      for (let i = 0; i < data.attack; i++) {
        var tmp = ['G','G','G','G','G','G','G','G','G','G']
        tmp[getRandomInt(0,9)] = ''
        greyLine(tmp)
      }
      sounds.attack1.play();
      return;
    }
  }
});

function startGame(){
  if (statusroom == "Waiting" && mystatus == "Waiting"){
    if(playersinroom.length > 1){
    socket.emit('askStartGame', roomnumber);
    }
    else{
      alert("You need at least 2 players to start a game");
      sounds.alert.play();
    }
  }
  else{
    alert("Game already started");
    sounds.alert.play();
  }
}

function displayStatusPLayer(status, place){
  contextPlayer.fillStyle = 'black';
  contextPlayer.globalAlpha = 0.75;
  contextPlayer.fillRect(0, canvasPlayer.height / 2 - 30, canvasPlayer.width, 60);

  contextPlayer.globalAlpha = 1;
  contextPlayer.fillStyle = 'white';
  contextPlayer.font = '36px monospace';
  contextPlayer.textAlign = 'center';
  contextPlayer.textBaseline = 'middle';
  contextPlayer.fillText(status, canvasPlayer.width / 2, canvasPlayer.height / 2 - ( 15 * (place > 0)));
  if(place){contextPlayer.fillText(place + "th", canvasPlayer.width / 2, canvasPlayer.height / 2 + 15);}
}

function displayStatusAdv(who, status, place){
  var whereme = playersinroom.indexOf(me.pseudo)
  var wherehim = playersinroom.indexOf(who)
  var cont = contextAdversary[wherehim > whereme ? wherehim -1  : wherehim ].context;
  var canvas = contextAdversary[wherehim > whereme ? wherehim -1  : wherehim ].canvas;
  cont.fillStyle = 'black';
  cont.globalAlpha = 0.75;
  cont.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

  cont.globalAlpha = 1;
  cont.fillStyle = 'white';
  cont.font = '15px monospace';
  cont.textAlign = 'center';
  cont.textBaseline = 'middle';
  cont.fillText(status, canvas.width / 2, canvas.height / 2 - 10);
  cont.fillText(place + "th", canvas.width / 2, canvas.height / 2 + 10); 
}

function diplayName(who){
  var whereme = playersinroom.indexOf(me.pseudo)
  var wherehim = playersinroom.indexOf(who)
  var cont = contextAdversary[wherehim > whereme ? wherehim -1  : wherehim ].context;
  var canvas = contextAdversary[wherehim > whereme ? wherehim -1  : wherehim ].canvas;
  cont.fillStyle = 'black';
  cont.globalAlpha = 1;
  cont.fillRect(0, 0, canvas.width, 40);

  cont.globalAlpha = 1;
  cont.fillStyle = 'white';
  cont.font = '15px monospace';
  cont.textAlign = 'center';
  cont.textBaseline = 'middle';
  cont.fillText(who, canvas.width / 2, 20);
}

function reduceCounter(){
  sounds.count.play();
  contextPlayer.fillStyle = 'black';
  contextPlayer.globalAlpha = 0.75;
  contextPlayer.fillRect(0, canvasPlayer.height / 2 - 30, canvasPlayer.width, 60);

  contextPlayer.globalAlpha = 1;
  contextPlayer.fillStyle = 'white';
  contextPlayer.font = '36px monospace';
  contextPlayer.textAlign = 'center';
  contextPlayer.textBaseline = 'middle';
  contextPlayer.fillText(counter, canvasPlayer.width / 2, canvasPlayer.height / 2);
  
  if(counter == 0){
    score = 0;
    lines = 0;
    level = 0;
    sounds.start.play();
    clearInterval(interval);
    contextPlayer.clearRect(0,0,canvasPlayer.width,canvasPlayer.height);
    for(n of contextAdversary){
      if(n.context == undefined){continue;}
      n.context.clearRect(0,0,n.canvas.width,n.canvas.height);
    }
    mystatus = "Playing";
    myplace = playersinroom.length;
    ingame = true;
    Game();
  }
  counter--;
}

function counterToStart(){
  seconds = 0;
  clearInterval(counter);
  ingame = false;
  counter = 3;
  contextPlayer.clearRect(0,0,canvasPlayer.width,canvasPlayer.height);
  interval =  setInterval(reduceCounter,1000); 
  contextPlayer.clearRect(0,0,canvasPlayer.width,canvasPlayer.height);
}

function drawAdv(who, playfield){
  var whereme = playersinroom.indexOf(me.pseudo)
  var wherehim = playersinroom.indexOf(who)
  var cont = contextAdversary[wherehim > whereme ? wherehim -1  : wherehim ].context;
  var canvas = contextAdversary[playersinroom.indexOf(who)].canvas;
  cont.clearRect(0,0,canvas.width,canvas.height);
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        cont.fillStyle = colors[name];

        // drawing 1 px smaller than the grid creates a grid effect
        cont.fillRect(col * 10, row * 10, 10-1, 10-1);
      }
    }
  }
}

socket.on('updatePlayfield',function(data){
  if(me.pseudo == data.pseudo){
    return;
  }
  drawAdv(data.pseudo, data.playfield);
  diplayName(data.pseudo);
});

socket.on('gameover-adv',function(data){
  if(myplace == 2){
    socket.emit('statusRoom',"Waiting");
    statusroom = "Waiting";
    mystatus = "Waiting";
    roomStatus.innerHTML = "Status :" + statusroom; 
  }
  if(me.pseudo == data.pseudo){
    myplace--;
    return;
  }  
  sounds.ko.play();
  playersalive.splice(playersalive.indexOf(data.pseudo),1)
  displayStatusAdv(data.pseudo, "Game Over", myplace);
  diplayName(data.pseudo);
  myplace--;
  
});


// https://tetris.fandom.com/wiki/Tetris_Guideline

// get a random integer between the range of [min,max]
// @see https://stackoverflow.com/a/1527820/2124254

// generate a new tetromino sequence
// @see https://tetris.fandom.com/wiki/Random_Generator
function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }
}

// rotate an NxN matrix 90deg
// @see https://codereview.stackexchange.com/a/186834
function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - j][i])
  );

  return result;
}

// check to see if the new matrix/row/col is valid
function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && (
          // outside the game bounds
          cellCol + col < 0 ||
          cellCol + col >= playfield[0].length ||
          cellRow + row >= playfield.length ||
          // collides with another piece
          playfield[cellRow + row][cellCol + col])
        ) {
        return false;
      }
    }
  }

  return true;
}

// place the tetromino on the playfield
function placeTetromino() {
  holdright = 0;
  var tmplines = lines;
  var tspin = 0;
  var perfectclear = 0;
  const comboTable = [0,0,1,1,1,2,2,3,3,4,4,4,5];
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {

        // game over if piece has any part offscreen
        if (tetromino.row + row < 0) {
          return showGameOver();
        }

        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  // check for line clears starting from the bottom and working our way up
  for (let row = playfield.length - 1; row >= 0; ) {
    if (playfield[row].every(cell => !!cell)) {
      lines++;
      // drop every row above this one
      if(row == perfectclear) {perfectclear++};
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          if(playfield[r][c] == 'T') {tspin++};
          
          playfield[r][c] = playfield[r-1][c];
        }
      }
    }
    else {
      row--;
    }
  }
  score += scorelines[lines-tmplines]*(level+1);
  level = Math.floor(lines/10);
  levelp.textContent = "Level: " + level;
  scorep.textContent = "Score: " + score;
  linesp.textContent = "Lines: " + lines;

  

  if(lines-tmplines > 0){
    combo++;
    tmp = lines-tmplines > 1 ? 2 ** (lines-tmplines-2) : 0;
    if(tmp == 0){ sounds.single.play();}
    if(tmp == 1){ sounds.double.play();}
    if(tmp == 2){ sounds.triple.play();}
    if(tmp == 4){ 
      sounds.tetris.play();
      if(b2b){
        tmp++;
      }
      b2b = 2;
     }
    
    if(tetromino.name == "T"){
      if(tspin > 1){
        tmp = (lines-tmplines)*2;
        if(b2b){
          tmp++;
        } 
        b2b = 2;
      }
      else{b2b--;}
    }
    if(perfectclear == 4){ tmp = 10; b2b = 2; sounds.perfect.play();}
    tmp += comboTable[combo > 12 ? 12 : combo];

    socket.emit('attackPlayer', {'pseudo': playersalive[getRandomInt(1,playersalive.length)-1] , 'attack': tmp});
    
  }
  else{ b2b = b2b > 0 ? b2b-1 : 0; combo = 0;}
  socket.emit('updatePlayfield', {'pseudo': me.pseudo , 'playfield': playfield});
  getQueueTetromino();
}

function holdTetromino(){
  contextHold.clearRect(0,0,hold.width,hold.height);
  holdfield = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  for (let row = 0; row < holding.matrix.length; row++) {
    for (let col = 0; col < holding.matrix[row].length; col++) {
      if (holding.matrix[row][col]) {
        holdfield[row+1][col] = holding.name;
      }
    }
  }
  holding.col = 3;
  holding.row = -1;
}
// get the next tetromino in the sequence
function getNextTetromino() {
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }

  const name = tetrominoSequence.pop();
  const matrix = tetrominos[name];

  // I and O start centered, all others start in left-middle
  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

  // I starts on row 21 (-1), all others start on row 22 (-2)
  const row = name === 'I' ? -1 : -2;

  return {
    name: name,      // name of the piece (L, O, etc.)
    matrix: matrix,  // the current rotation matrix
    row: row,        // current row (starts offscreen)
    col: col,         // current col
    time: 0,
    maxTime: 0
  };
}
function getQueueTetromino(){
  queuefield = [];
  tetromino = queueTetromino.shift();
  queueTetromino.push(getNextTetromino());
  contextQueue.clearRect(0,0,queue.width,queue.height); 
  for (let num = 0; num < queueTetromino.length; num++) {
    var tmp = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    for (let row = 0; row < queueTetromino[num].matrix.length; row++) {
      for (let col = 0; col < queueTetromino[num].matrix[row].length; col++) {
        if (queueTetromino[num].matrix[row][col]) {
          tmp[row+1][col] = queueTetromino[num].name;
        }
      }
    }
    queuefield.push(tmp); 
  }
}  
// show the game over screen
function showGameOver() {
  sounds.gameover.play();
  clearInterval(countertimegame);
  cancelAnimationFrame(rAF);
  gameOver = true;
  seconds = 0;
  displayStatusPLayer("Game Over", myplace);
  socket.emit('gameover-multi', {"pseudo": me.pseudo});
}

function reset_holdfield(){
  holdfield = []; 
  // populate the empty state
  for (let row = 0; row < 4; row++) {
    holdfield[row] = [];

    for (let col = 0; col < 4; col++) {
      holdfield[row][col] = 0;
    }
  }  
}

function reset_playfield(){
  playfield = [];
  // populate the empty state
  for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }  
}

// how to draw each tetromino
// @see https://tetris.fandom.com/wiki/SRS

function incrementSeconds() {
    seconds += 1;
    timep.textContent = "Time: " + seconds + "s";
}
function timeTetromino(tetromino){
  tetromino.time = 1;
}
function maxTimeTetromino(tetromino){
  tetromino.maxTime += 1;
}

// game loop
function loop() {
  if(ingame == false){
    return;
  }
  rAF = requestAnimationFrame(loop);
  contextPlayer.clearRect(0,0,canvasPlayer.width,canvasPlayer.height);
  contextQueue.clearRect(0,0,queue.width,queue.height);
  contextHold.clearRect(0,0,hold.width,hold.height);

  for (let num = 0; num < queuefield.length; num++) {
    for (let row = 0; row < queuefield[num].length; row++) {
      for(let col = 0; col < queuefield[num][row].length; col++){
        if (queuefield[num][col][row]) {
          const name = queuefield[num][col][row]  ;
          contextQueue.fillStyle = colors[name];
          // drawing 1 px smaller than the grid creates a grid effect
          contextQueue.fillRect( row * 25,  (num * 4 +col) * 20, 25-1, 20-1);
        }
      }
    }
  }
  if(holding){
    for (let row = 0; row < holdfield.length; row++) {
      for (let col = 0; col < holdfield[row].length; col++) {
        if (holdfield[row][col]) {
          const name = holdfield[row][col];
          contextHold.fillStyle = colors[name];
          // drawing 1 px smaller than the grid creates a grid effect
          contextHold.fillRect(col * 20, row * 20, 20-1, 20-1);
        }
      }
    }
  }
  // draw the playfield
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        contextPlayer.fillStyle = colors[name];

        // drawing 1 px smaller than the grid creates a grid effect
        contextPlayer.fillRect(col * grid, row * grid, grid-1, grid-1);
      }
    }
  }

  // draw the active tetromino
  if (tetromino) {

    // tetromino falls every 35 frames
    if (++count > (35-level*3)) {
      tetromino.row++;
      count = 0;

      // place piece if it runs into anything
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--;
        if (tetromino.time == 0){
            tetrotime = setInterval(timeTetromino, 500, tetromino);
            maxtimetetro = setInterval(maxTimeTetromino, 1000, tetromino);
        }
        else if(tetromino.time == 1 || tetromino.maxTime == 4){
          clearInterval(tetrotime);
          clearInterval(maxtimetetro);
          tetromino.time = 0;
          maxtime = 0;
          placeTetromino();
        }
      }
    }

    contextPlayer.fillStyle = colors[tetromino.name];

    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {

          // drawing 1 px smaller than the grid creates a grid effect
          contextPlayer.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
        }
      }
    }
  }
}

function Game(){
  countertimegame = setInterval(incrementSeconds, 1000);
  reset_playfield();
  reset_holdfield();
  gameOver = false;

  for (let row = 0; row < 5; row++) {
    queueTetromino[row] = getNextTetromino();
  }

  getQueueTetromino();

  // start the game
  rAF = requestAnimationFrame(loop);

  
}



  // listen to keyboard events to move the active tetromino
  document.addEventListener('keydown', function(e) {
    if (gameOver || rAF == 0 || buttonSettingsState ) return;
    // left and right arrow keys (move)
    if (e.key === inputs.left.value || e.key === inputs.right.value) {
      sounds.move.play();
      const col = e.key === inputs.left.value
        ? tetromino.col - 1
        : tetromino.col + 1;
  
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.time = 0;
        tetromino.col = col;
      }
    }
  
    // up arrow key (rotate)
    if (e.key === inputs.rotate.value) {
      sounds.rotate.play();
      const matrix = rotate(tetromino.matrix);
      if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
      }
    }
  
    // down arrow key (soft drop or place piece)
    if(e.key === inputs.down.value) {
      const row = tetromino.row + 1;
  
      if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row - 1;
        sounds.softdrop.play();
        placeTetromino();
        return;
      }
  
      tetromino.row = row;
    }
    //space bar to drop piece
    if(e.key === inputs.harddrop.value) {
      e .preventDefault();
      while(isValidMove(tetromino.matrix, tetromino.row + 1, tetromino.col)) {
        tetromino.row++;
      }
      sounds.harddrop.play();
      placeTetromino();
      return;
      
    }
    if(e.key === inputs.hold.value) {
      if(holdright) return;
      holdright = true;
      sounds.hold.play();
      e.preventDefault();
      if(holding) {
        const temp = tetromino;
        tetromino = holding;
        holding = temp;
        holdTetromino();
      }
      else {
        holding = tetromino;
        getQueueTetromino();
        holdTetromino();
      }
    }
  });
document.querySelectorAll("button").forEach( function(item) {
  item.addEventListener('focus', function() {
      this.blur();
  });   
});
