const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const hold = document.getElementById('hold');
const contextHold = hold.getContext('2d');
const queue = document.getElementById('queue');
const contextQueue = queue.getContext('2d');
const grid = 32;
const tetrominoSequence = []; 
var holdright = false;

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
  'L': 'orange'
};

let count = 0;
var level = 0;
var score = 0;
const scorelines = [0, 40, 100, 300, 1200];
let rAF = null;  // keep track of the animation frame so we can cancel it
let gameOver = false;
var scorep = document.getElementById('score');
var linesp = document.getElementById('line');
var levelp = document.getElementById('level');
var timep = document.getElementById('time');

var seconds = 0;
var counter = 0;

let holding = 0;
var playfield = [];
var holdfield = [];
var queuefield = [];
var queueTetromino = [];
var lines = 0;

reset_playfield();
reset_holdfield();

for (let row = 0; row < 5; row++) {
  queueTetromino[row] = getNextTetromino();
}

getQueueTetromino();

// https://tetris.fandom.com/wiki/Tetris_Guideline

// get a random integer between the range of [min,max]
// @see https://stackoverflow.com/a/1527820/2124254
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
      
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r-1][c];
        }
      }
    }
    else {
      row--;
    }
  }
  if(lines-tmplines == 1){
    sounds.single.play();
  }
  else if(lines-tmplines == 2){
    sounds.double.play();
  }
  else if(lines-tmplines == 3){
    sounds.triple.play();
  }
  else if(lines-tmplines == 4){
    sounds.tetris.play();
  }

  score += scorelines[lines-tmplines]*(level+1);
  level = Math.floor(lines/10);
  levelp.textContent = "Level: " + level;
  scorep.textContent = "Score: " + score;
  linesp.textContent = "Lines: " + lines;
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
  clearInterval(counter);
  cancelAnimationFrame(rAF);
  gameOver = true;
  sounds.gameover.play();
  background_music.pause();

  context.fillStyle = 'black';
  context.globalAlpha = 0.75;
  context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '36px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
  socket.emit('gameover-solo', {"pseudo": me.mdp ? me.pseudo : "","score":{"score":score, "time":seconds, "lines":lines, "level":level}});
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

function buttonStartGame() {
  background_music.play();
  sounds.start.play();
  for (let row = 0; row < 5; row++) {
    queue[row] = getNextTetromino();
  }
  clearInterval(counter);
  lines = 0;
  score = 0;
  queuefield = [];
  getQueueTetromino();
  gameOver = false;
  holding = null;
  reset_holdfield();
  reset_playfield();
  seconds = -1;
  counter = setInterval(incrementSeconds, 1000);
  incrementSeconds()
  cancelAnimationFrame(rAF);
  rAF = 0;
  tetromino = getNextTetromino();
  context.clearRect(0,0,canvas.width,canvas.height);
  contextHold.clearRect(0,0,hold.width,hold.height);
  rAF = requestAnimationFrame(loop);
  
}

function incrementSeconds() {
    seconds += 1;
    timep.textContent = "Time: " + seconds + "s";
}

var timetetro;
var maxtimetetro;
var maxtime;
function timeTetromino(tetromino){
  tetromino.time = 1;
}
function maxTimeTetromino(tetromino){
  tetromino.maxTime += 1;
}

// game loop
function loop() {
  rAF = requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);
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
        context.fillStyle = colors[name];

        // drawing 1 px smaller than the grid creates a grid effect
        context.fillRect(col * grid, row * grid, grid-1, grid-1);
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

    context.fillStyle = colors[tetromino.name];

    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {

          // drawing 1 px smaller than the grid creates a grid effect
          context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
        }
      }
    }
  }
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
  })
})
