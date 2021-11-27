const player1 = new Image();
player1.src = "img/1.png"

const player2 = new Image();
player2.src = "img/2.png"



const getClickCoordinates = (element, ev) => {
  const { top, left } = element.getBoundingClientRect();
  const { clientX, clientY } = ev;

  return {
    x: clientX - left,
    y: clientY - top
  };
};

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
var gameCodeInput = document.getElementById('gameCodeInput');
var gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

let playerNumber;

function newGame() {
  sock.emit('newGame');
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  sock.emit('joinGame', code)
  init();
}

function handleGameCode(gamecode) {
  console.log(gamecode)
  gameCodeDisplay.innerText = gamecode;
}


function handleUnknownGame(){
  backtoscreen()
  alert("Unknown game code")
}

function handleTooManyPlayers(){
  backtoscreen()
  alert("Room is full!")
}

function backtoscreen(){
  gameCodeInput.value=" ";
  gameCodeDisplay.innerText=" ";
  console.log(gameCodeInput)
  gameScreen.style.display = "none";
  initialScreen.style.display="block";
  console.log("done")
  playerNumber= null;
}

function gameOver(number){
  if(playerNumber==number) {
    alert("YOU WIN!")
    //backtoscreen()
  }
  else {
    alert("YOU LOOSE!")
    //backtoscreen()
  }
}

const sock = io("https://polar-anchorage-28299.herokuapp.com2323/");
sock.on('init', handleInit);
sock.on('gameCode', handleGameCode)
sock.on('unknownGame', handleUnknownGame)
sock.on('tooManyPlayers', handleTooManyPlayers)



const getBoard = (canvas, numCells = 7) => {

  const ctx = canvas.getContext('2d');
  const cellSize = Math.floor(canvas.width/numCells);

  const fillCell = (x, y, color, playnum) => {
    //ctx.fillStyle = color;  
    //ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
    if(playnum==1)
      ctx.drawImage(player1,x*cellSize, y*cellSize)
    if(playnum==2)
      ctx.drawImage(player2,x*cellSize, y*cellSize)
  };

  //GAMEBOARD DRAW
  const drawGrid = () => {
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    for (let i = 0; i < numCells + 1; i++) {
      ctx.moveTo(i*cellSize, 0);
      ctx.lineTo(i*cellSize, cellSize*(numCells-1));

      if (i<numCells) {
        ctx.moveTo(0, i*cellSize);
        ctx.lineTo(cellSize*numCells, i*cellSize); 
      }
    }
    ctx.stroke();
  };
  //END OF GAMEBOARD

  const clear = () => { //clears the whole canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const renderBoard = (board = []) => { //by default we make a board an empty array!
    board.forEach((row, y) => {
      row.forEach((color, x) => {
        color && fillCell(x, y, color); //if color exists and is not null
      });
    });
  };

  const reset = (board) => {
    clear();
    drawGrid();
    renderBoard(board)
  };

  const getCellCoordinates = (x, y) => {
    return {
      x: Math.floor(x/cellSize),
      y: Math.floor(y/(cellSize))
    };
  };

  return { fillCell, reset, getCellCoordinates };
};


function init () {
  initialScreen.style.display ="none";
  gameScreen.style.display="block";

  const canvas = document.querySelector('canvas');


  const { fillCell, reset, getCellCoordinates } = getBoard(canvas);

  const onClick = (e) => {
    const { x, y } = getClickCoordinates(canvas, e);
    sock.emit('turn', getCellCoordinates(x, y));
  };
  sock.on('gameover', gameOver)
  sock.on('board', reset);
  sock.on('turn', ({ x, y, color, playnum }) => fillCell(x, y, color, playnum));


  canvas.addEventListener('click', onClick);
  
}


function handleInit (number){
  playerNumber = number
  console.log(playerNumber)
}