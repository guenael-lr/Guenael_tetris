import express from 'express';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
import { fileURLToPath } from 'url';
import { generate, count } from "random-words";
import * as http from 'http';
import { readFileSync, appendFileSync, writeFileSync } from 'fs';
import serve_static from 'serve-static';
const __dirname = path.dirname(__filename);
const app = express();
app.use(serve_static(__dirname + "/public"));
var serveur = http.Server(app);
import {Server} from 'socket.io';
var io = new Server(serveur);
import bcrypt from 'bcrypt';

serveur.listen(8080);
var listRegister = JSON.parse(readFileSync('accounts.json', 'utf8')); //json des register 
var score = JSON.parse(readFileSync('scores.json', 'utf8')); //json des scores

var privaterooms = [];
var publicrooms = [
  {
    name: 0,
    players: [],
    status: "Waiting",
    maxPlayers: 10,
    private: false
  },
  {
    name: 1,
    players: [],
    status: "Waiting",
    maxPlayers: 8,
    private: false
  },
  {
    name: 2,
    players: [],
    status: "Waiting",
    maxPlayers: 5,
    private: false
  },
  {
    name: 3,
    players: [],
    status: "Waiting",
    maxPlayers: 7,
    private: false
  },
  {
    name: 4,
    players: [],
    status: "Waiting",
    maxPlayers: 6,
    private: false
  },
  {
    name: 5,
    players: [],
    status: "Waiting",
    maxPlayers: 8,
    private: false
  },


];

io.on('connect', async function (socket) {
  var whichroom = null;
  var pseudo = null;
  socket.on('get-pseudo', (data) => { 
    if(data){
      pseudo = data;
      return;
    }
    pseudo = generate() + (Math.random()).toString().substring(2, 5);
    socket.emit('set-pseudo', pseudo);
  });
  socket.on('register', async function (user) { //socket qui gère la partie register 
      user.mdp = await bcrypt.hash(user.mdp, 10);
      for (const n of listRegister) {
          if (n.pseudo == user.pseudo) {
              socket.emit('alert', "Username " + user.pseudo + " already taken !");
              flag = true;
              return;
          }
      }

      socket.emit('alert', "Welcome " + user.pseudo + " !");
      socket.emit('logged-in', user);
      pseudo = user.pseudo;
      listRegister.push(user);
      const listToJSON = JSON.stringify(listRegister);
      writeFileSync('accounts.json', listToJSON, 'utf8');
      return;
  }); 
  socket.on('login', async function (user) { //socket qui gère la partie login 
    
      for (const p of listRegister) {
        if(p.pseudo == user.pseudo){
         
          if(await bcrypt.compare(user.mdp, p.mdp)){
            user.mdp = p.mdp;
            pseudo = user.pseudo;
            socket.emit('logged-in', user);
            return;
          }

          if(user.mdp == p.mdp){
            user.mdp = p.mdp;
            pseudo = user.pseudo;
            socket.emit('logged-in', user);
            return;
          }

          socket.emit('alert', "Wrong Password");

          return;
        }
      } 
      socket.emit('alert', "Unknow User");
      return;
  });
  socket.on('gameover-solo', function(data){
    if(!data.pseudo){
      return;
    }
    for (const n of score) {
      if(n.pseudo == data.pseudo){
        if(n.score.score < data.score.score){
          n.score = data.score;
          score.push({pseudo: data.pseudo, score: data.score});
          const scores = JSON.stringify(score);
          writeFileSync('scores.json', scores, 'utf8')
          return;
        }
        else if(n.score.score == data.score.score && n.score.time < data.score.time){
          n.score = data.score;
          score.push({pseudo: data.pseudo, score: data.score});
          const scores = JSON.stringify(score);
          writeFileSync('scores.json', scores, 'utf8')
          return;
        }
      }
    }
    return;
  })
  socket.on('get-scores', function(){ 
    socket.emit('scores', score);
  })
  socket.on('disconnect', function (data) { //socket qui gère la déconnection d'un utlisateur
    if (whichroom != null) {
      whichroom.players.splice(whichroom.players.indexOf(pseudo), 1);
      io.sockets.in(whichroom.name).emit('playerleft', pseudo);
      if (whichroom.players.length == 0) {
        if (whichroom.private) {
          privaterooms.splice(privaterooms.indexOf(whichroom), 1);
        }
        else {
          publicrooms.splice(publicrooms.indexOf(whichroom), 1);
        }
      }
    }
  });
  socket.on('connectMe', function(data){
    if(data.pseudo == ""){
      pseudo = randomwords() + (Math.random()).toString().substring(2, 5);
      socket.emit('set-pseudo', pseudo);
    }
    pseudo = data.pseudo;
    if (data.nmbr == ""){
      for (const n of publicrooms){
        if(n.players.length < 10){
          n.players.push(data.pseudo);
          whichroom = n;
          socket.emit('connectToRoom', { "room": n.name, "players": n.players, "status": n.status })
          socket.join(n.name);
          io.sockets.in(n.name).emit('newplayer', data.pseudo)
          return;
        }
      }
      var room = {
          name: publicrooms.length,
          players: [data.pseudo],
          status: "Waiting",
          maxPlayers: 10,
          private: false
        };
      publicrooms.push(room);
      socket.join(room.name);
      whichroom = room;
      socket.emit('connectToRoom', { "room": room.name, "players": room.players, "status": room.status })
      io.sockets.in(room.name).emit('newplayer',data.pseudo)
      return;
    }
    else{
      if(checkRooms(socket, data)){
        socket.emit('alert', "The room you tried to join is full or doesn't exist anymore !");
       }
      }
  });
  socket.on('askStartGame', function(data){ 
    if(whichroom){
      io.sockets.in(whichroom.name).emit('startGame', data);
    }
  });
  socket.on('updatePlayfield', function(data){
    if(whichroom){
      io.sockets.in(whichroom.name).emit('updatePlayfield', data);
    }
  });
  socket.on('gameover-multi', function(data){
    if(whichroom){
      io.sockets.in(whichroom.name).emit('gameover-adv', data);
    }
  });
  socket.on('attackPlayer', function(data){
    if(whichroom){
      io.sockets.in(whichroom.name).emit('getAttack', data);
    }
  });
  socket.on('statusRoom', function(data){
    if(whichroom){
      whichroom.status = data;
      io.sockets.in(whichroom.name).emit('setStatusRoom', data);
    }
  });
  socket.on('get-public-rooms', function(){
    socket.emit('public-rooms', publicrooms);
  });
  socket.on("create-room", function(data){
    if (!pseudo){
      pseudo = randomwords() + (Math.random()).toString().substring(2, 5);
      socket.emit('set-pseudo', pseudo);
    }
    var room = {
      name: data.name,
      players: [pseudo],
      status: "Waiting",
      maxPlayers: data.maxPlayers,
      private: data.private
    };
    if(data.private){
      privaterooms.forEach(element => {
        if(element.name == data.name){
          socket.emit('alert', "This room already exist !");
          return;
        }
      });
      privaterooms.push(room);
    }
    else{
      publicrooms.forEach(element => {
        if(element.name == data.name){
          socket.emit('alert', "This room already exist !");
          return;
        }
      });
      publicrooms.push(room);
    };
    if(whichroom != null){
      socket.leave(whichroom.name);
      whichroom.players.splice(whichroom.players.indexOf(pseudo), 1);
      io.sockets.in(whichroom.name).emit('playerleft', pseudo);
      if (whichroom.players.length == 0) {
        if (whichroom.private) {
          privaterooms.splice(privaterooms.indexOf(whichroom), 1);
        }
        else {
          publicrooms.splice(publicrooms.indexOf(whichroom), 1);
        }
      }
    }
    socket.join(room.name);
    whichroom = room;
    socket.emit('connectToRoom', { "room": room.name, "players": room.players, "status": room.status })
  }); 
  function checkRooms(socket, data){
    for (const n of privaterooms){
      if(n.name == data.nmbr && n.players.length < 10){
        socket.join(n.name);
        n.players.push(data.pseudo);
        whichroom = n;
        socket.emit('connectToRoom', { "room": n.name, "players": n.players, "status": n.status });
        io.sockets.in(n.name).emit('newplayer', data.pseudo);
  
        return 0;
      }
    }
    for (const n of publicrooms){
      if(n.name == data.nmbr && n.players.length < 10){
        socket.join(n.name);
        whichroom = n;
        n.players.push(data.pseudo);
        socket.emit('connectToRoom', { "room": n.name, "players": n.players, "status": n.status });
        io.sockets.in(n.name).emit('newplayer', data.pseudo);
        return 0;
      }
    }
    return 1;
  }
});

