const wrapper= document.querySelector('.wrapper'),
    loginLink = document.querySelector('.login-link'),
    registerLink = document.querySelector('.register-link'),
    close = document.querySelector('.close');

var loginstate = false;

var socket = io();
//open wrapper if login=true is in the url
if(window.location.href.indexOf("login=true") > -1) {
    wrapper.classList.add('display-on');
    div_solo.classList.add('display-none');
    div_multi.classList.add('display-none');
    wrapper.classList.remove('active');
    loginstate = true;
}

if(registerLink){
    registerLink.addEventListener('click', () => {
         wrapper.classList.add('active');
    }); 
};
     
if(loginLink){ 
    loginLink.addEventListener('click', () =>{
    wrapper.classList.remove('active');
    });
}

if(btnLoginPopUp){
    btnLoginPopUp.addEventListener('click', () =>{
        if(!loginstate){
            wrapper.classList.add('display-on');
            div_solo.classList.add('display-none');
            div_multi.classList.add('display-none');
            wrapper.classList.remove('active');
            loginstate = true;
        }
        else{
            wrapper.classList.remove('display-on');
            div_solo.classList.remove('display-none');
            div_multi.classList.remove('display-none');
        loginstate = false;
        }
        
    });
}


if(close){
    close.addEventListener('click', () =>{
        wrapper.classList.add('active');
        wrapper.classList.remove('display-on');
        div_solo.classList.remove('display-none');
        div_multi.classList.remove('display-none');
        loginstate = false;
    });
}



var registerCheck = function(){
    socket.emit('register', {
        pseudo: document.getElementById('usr-reg').value,
        email: document.getElementById('mail-reg').value,
        mdp: document.getElementById('mdp-reg').value,
    });
}

var loginCheck = function(){

    socket.emit('login', {
        pseudo: document.getElementById('usr-log').value,
        mdp: document.getElementById('mdp-log').value,
    });
}


socket.on('alert', (data) => {
   alert(data);
});

socket.on('logged-in', (data) => {
    setCookie('user', data.pseudo, {secure: true, 'max-age': 3600});
    setCookie('mdp', data.mdp, {secure: true, 'max-age': 3600});
    btnLoginPopUp.classList.add('display-none');
    div_username.classList.remove('display-none');
    username.innerHTML = data.pseudo;
    wrapper.classList.remove('display-on');
    div_solo.classList.remove('display-none');
    div_multi.classList.remove('display-none');
  });
  
  