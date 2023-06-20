const lobby= document.querySelector('.lobby');
const divsmulti = document.querySelectorAll('.div-multi');
const list_room = document.querySelector('.list-room');
const inputRoomName = document.getElementById('roomName');
const inputMaxPlayers = document.getElementById('maxPlayer');
const private = document.getElementById('private');

var buttonLobbyState = false;

socket.emit('get-public-rooms');

socket.on('public-rooms', (data) => {
    for (n of data){
        var div = document.createElement('div');
        div.classList.add('room');
        var name = document.createElement('p');
        name.innerHTML = n.name;
        div.appendChild(name);
        var p = document.createElement('p');
        p.innerHTML = n.players.length + "/" + n.maxPlayers;
        div.appendChild(p);
        var button = document.createElement('button');
        button.innerHTML = "Join";
        button.id = n.name;
        button.classList.add('button-join');
        button.onclick = function(){
            location.href='?' + this.id;
        }
        div.appendChild(button);
        
        list_room.appendChild(div);
    }
});



function showLobby(){
    if(!buttonLobbyState){
        list_room.innerHTML = "";
        socket.emit('get-public-rooms');
        lobby.classList.add('active');
        divsmulti.forEach((element) => {
            element.classList.add('active');
          });
        buttonLobbyState = true;
    }
    else{
        lobby.classList.remove('active');
        divsmulti.forEach((element) => {
            element.classList.remove('active');
          });
        buttonLobbyState = false;
    }
}

function createGame(){
    socket.emit('create-room', {
        name: inputRoomName.value,
        maxPlayers: inputMaxPlayers.value,
        private: private.checked
    });
    showLobby();
}


if(inputRoomName){
    inputRoomName.addEventListener('focus', () => {
        inputRoomName.classList.add('listening');
    });
    inputRoomName.addEventListener('focusout', () => {
        inputRoomName.classList.remove('listening');
    });
}

if(inputMaxPlayers){
    inputMaxPlayers.addEventListener('focus', () => {
        inputMaxPlayers.classList.add('listening');
    });
    inputMaxPlayers.addEventListener('focusout', () => {
        inputMaxPlayers.classList.remove('listening');
    });
}
