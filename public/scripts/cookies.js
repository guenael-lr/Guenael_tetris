var socket = io();
const 
    btnLoginPopUp = document.querySelector('.btnLoginPopUp'),
    div_username = document.querySelector('.username'),
    username = document.querySelector('.username-account'),
    div_solo = document.querySelector('.div-solo'),
    div_multi = document.querySelector('.div-multi'),
    usermenu = document.querySelector('.user-menu');
    wrapper = document.querySelector('.wrapper');
 
var usermenustate= false;
var me = {
  pseudo: null,
  mdp: null
};

function setCookie(name, value, options = {}) {

  options = {
    path: '/',
    // add other defaults here if necessary
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function deleteCookie(name) {
  setCookie(name, "", {
    'max-age': -1
  })
}

var logOut = function(){
  div_username.classList.add('display-none');
  btnLoginPopUp.classList.remove('display-none');
  deleteAllCookies();
}

if (getCookie('user')){
  if(getCookie('mdp')){
    socket.emit('login', {
        pseudo: getCookie('user'),
        mdp: getCookie('mdp'),
    });

    socket.on('logged-in', (data) => {
      setCookie('user', data.pseudo, {secure: true, 'max-age': 3600});
      setCookie('mdp', data.mdp, {secure: true, 'max-age': 3600});
      btnLoginPopUp.classList.add('display-none');
      div_username.classList.remove('display-none');
      username.innerHTML = data.pseudo;
      if (wrapper){
        wrapper.classList.remove('display-on');
        div_solo.classList.remove('display-none');
        div_multi.classList.remove('display-none');
      }
      me = {
        pseudo: data.pseudo,
        mdp: data.mdp
      }
      socket.emit('get-pseudo', me.pseudo)      
    });
  }
  me = {
    pseudo: getCookie('user'),
    mdp: null
  }
  socket.emit('get-pseudo', me.pseudo)
}

else{
  deleteAllCookies();
  socket.emit('get-pseudo');
}

function deleteAllCookies(){
    deleteCookie('user');
    deleteCookie('mdp');

}

if(username){
  username.addEventListener('click', () =>{
    
      if(!usermenustate){
          usermenu.classList.remove('display-none');
          usermenustate = true;
      }
      else{
          usermenu.classList.add('display-none');
          usermenustate = false;
      }
  });
}

if(div_username){
  div_username.addEventListener('click', () =>{
      if(!usermenustate){
          usermenu.classList.remove('display-none');
          usermenustate = true;
      }
      else{
          usermenu.classList.add('display-none');
          usermenustate = false;
      }
  });
}

socket.on('alert', (data) => {
  alert(data);
  sounds.alert.play();
});

socket.on('set-pseudo', (data) => {
  me = {
    pseudo: data,
    mdp: null
  }
  setCookie('user', me.pseudo, {secure: true, 'max-age': 3600});
});


