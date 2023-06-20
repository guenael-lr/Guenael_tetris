var socket = io();
const listscores = document.querySelector('.tbody');

socket.emit('get-scores');

socket.on('scores', (data) => {
    data.sort(function (a, b) {
        if (a.score.score > b.score.score) {
            return -1;
        }
    });
    //listscores.textContent = '';
    for (n of data) {
        listscores.innerHTML += '<tr><th>' 
        + n.pseudo + '</th><th>' 
        + n.score.score + '</th><th>' 
        + n.score.time + '</th><th>' 
        + n.score.lines+ '</th><th>' 
        + n.score.level + '</th></tr>';
    }
});

socket.on('logged-in', (data) => {
    setCookie('user', data.pseudo, {secure: true, 'max-age': 3600});
    setCookie('mdp', data.mdp, {secure: true, 'max-age': 3600});
    btnLoginPopUp.classList.add('display-none');
    div_username.classList.remove('display-none');
    username.innerHTML = data.pseudo;
    if (wrapper){
      wrapper.classList.remove('display-on');
  }
  });

