const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const randomColor = require('randomcolor');
const createBoard = require('./create-board');


const app = express();

app.use(express.static(`http://hape-games.fun/Connect4/client`))

const server = http.createServer(app);
const io = socketio(server);



const allboards = {};
const clientRooms = {};
const turnstate = {};

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

io.on('connection', (sock) => {
  const color = randomColor();

  sock.on('newGame',handleNewGame)
  function handleNewGame(){
    let roomName = makeid(5);
    clientRooms[sock.id] = roomName;

    sock.emit('gameCode', roomName);
    sock.join(roomName)
    
    sock.number = 1;
    sock.gameCode = roomName
    sock.emit('init', sock.number)
  }

  sock.on('joinGame', handleJoinGame)
  function handleJoinGame(gameCode){
    const room = io.sockets.adapter.rooms[gameCode];
    let allUsers;
    if(room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers){
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      sock.emit('unknownGame')
      return;
    }
    else if (numClients >1) {
      sock.emit('tooManyPlayers')
      return;
    }

    clientRooms[sock.id] = gameCode;
    turnstate[gameCode] = [1,0]
    sock.join(gameCode);
    sock.emit('gameCode', gameCode);
    sock.number = 2;
    sock.gameCode = gameCode
    sock.emit('init', sock.number)

    
    
    //When the second player joins, the board is created and emitted
    
    allboards[gameCode] =  new createBoard(7)
    io.sockets.in(gameCode).emit('restart', 'START');
  }


  sock.on('turn', ({ x, y }) => {
      boardclass = allboards[clientRooms[sock.id]]
      var turn = turnstate[clientRooms[sock.id]][sock.number-1]

    if (turn) {
      boardclass = allboards[clientRooms[sock.id]]

      //console.log(Object.keys(io.nsps['/'].adapter.rooms[clientRooms[sock.id]].sockets)[0])
      
      const gravityy = boardclass.gravity(x,y)[0]
      const validmove = boardclass.gravity(x,y)[1]
      y=gravityy
      const playerWon = boardclass.makeTurn(x, y, color);

      //emitGameState(roomName, state[roomName])
      playnum = sock.number

      if(validmove) {
        turnstate[clientRooms[sock.id]][sock.number-1] = 0

        if(sock.number == 2){
          turnstate[clientRooms[sock.id]][0] = 1
        }
        if(sock.number == 1){
          turnstate[clientRooms[sock.id]][1] = 1
        }

        io.sockets.in(clientRooms[sock.id])
          .emit('turn', { x, y, color, playnum });
      }

      if (playerWon) {
        //var clients_in_the_room = io.sockets.in(clientRooms[sock.id]); 
        //console.log(Object.keys(clients_in_the_room.sockets))
        setTimeout(function(){
          io.sockets.in(clientRooms[sock.id])
            .emit('gameover', sock.number);
      
          boardclass.clear();
          boardclass.boardcount = 0;
          io.sockets.in(clientRooms[sock.id])
            .emit('restart');
        },30);
      }

      if(boardclass.boardcount==42) {//Its a tie

        setTimeout(function(){
          io.sockets.in(clientRooms[sock.id])
            .emit('gameover', 42);
      
          boardclass.clear();
          boardclass.boardcount = 0;
          io.sockets.in(clientRooms[sock.id])
            .emit('restart');
        },30);

      }
    }
  });

});

server.on('error', (err) => {
  console.error(err);
});

server.listen(process.env.PORT || 8080, () => {
  console.log('server is ready');
});

