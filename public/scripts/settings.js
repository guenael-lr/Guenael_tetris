const settings= document.querySelector('.settings'),
leftinput = document.getElementById('left'),
rightinput = document.getElementById('right'),
downinput = document.getElementById('down'),
rotateinput = document.getElementById('rotate'),
holdinput = document.getElementById('holdpiece'),
harddropinput = document.getElementById('hardDrop'),
musicinput = document.getElementById('musicSlider'),
soundinput = document.getElementById('soundSlider');

var buttonSettingsState = false;
var background_music = new Audio('audio/background_music.m4a');
background_music.loop = true;


var reset_inputs = {
    'left' : {'value' : "ArrowLeft" },
    'right' : {'value' : "ArrowRight" },
    'down' : {'value' : "ArrowDown" },
    'rotate' : {'value' : "ArrowUp" },
    'hold' : {'value' : "c" },
    'harddrop' : {'value' : " "}
}

var inputs = {
    'left' : {'value' : "ArrowLeft" },
    'right' : {'value' : "ArrowRight" },
    'down' : {'value' : "ArrowDown" },
    'rotate' : {'value' : "ArrowUp" },
    'hold' : {'value' : "c" },
    'harddrop' : {'value' : " "}
}

var reset_volume = {
    'music' : 0.1,
    'sound' : 0.1
}

var volume = {
    'music' : 0.1,
    'sound' : 0.1
}

var sounds = {
    'clear' : new Audio('audio/General Sounds/me_game_clear.wav'),
    'gameover' : new Audio('audio/General Sounds/me_game_gameover.wav'),
    'ko' : new Audio('audio/General Sounds/me_game_ko_vo.wav'),
    'attack1' : new Audio('audio/General Sounds/se_game_attack1.wav'),  
    'attack2' : new Audio('audio/General Sounds/se_game_attack2.wav'),
    'count' : new Audio('audio/General Sounds/se_game_count.wav'),
    'double' : new Audio('audio/General Sounds/se_game_double.wav'),
    'harddrop' : new Audio('audio/General Sounds/se_game_harddrop.wav'),
    'hold' : new Audio('audio/General Sounds/se_game_hold.wav'),
    'move' : new Audio('audio/General Sounds/se_game_move.wav'),
    'perfect' : new Audio('audio/General Sounds/se_game_perfect.wav'),
    'rotate' : new Audio('audio/General Sounds/se_game_rotate.wav'),
    'single' : new Audio('audio/General Sounds/se_game_single.wav'),
    'softdrop' : new Audio('audio/General Sounds/se_game_softdrop.wav'),
    'start' : new Audio('audio/General Sounds/se_game_start2.wav'),
    'tetris' : new Audio('audio/General Sounds/se_game_tetris.wav'),
    'triple' : new Audio('audio/General Sounds/se_game_triple.wav'),
    'alert' : new Audio('audio/General Sounds/se_sys_alert.wav'),
    'new_player' : new Audio('audio/General Sounds/se_sys_new_player.wav'),
}

if(getCookie('volume')){   
    volume = JSON.parse(getCookie('volume'));
    background_music.volume = volume.music;
    for (const key in sounds) {
       key.volume = volume.sound;
    }
}

if(getCookie('inputs')){
    inputs = JSON.parse(getCookie('inputs'));
}

leftinput.value = inputs.left.value;
rightinput.value = inputs.right.value;
downinput.value = inputs.down.value;
rotateinput.value = inputs.rotate.value;
holdinput.value = inputs.hold.value;
harddropinput.value = inputs.harddrop.value;
musicinput.value = volume.music*100;
soundinput.value = volume.sound*100;
background_music.volume = volume.music;
for (const key in sounds) {
    sounds[key].volume = volume.sound;
}  

if(leftinput){
    leftinput.addEventListener('focus', () => {
        leftinput.classList.add('listening');
    });
    leftinput.addEventListener('focusout', () => {
        leftinput.classList.remove('listening');
    });
}

if(rightinput){
    rightinput.addEventListener('focus', () => {
        rightinput.classList.add('listening');
    });
    rightinput.addEventListener('focusout', () => {
        rightinput.classList.remove('listening');
    });
}

if(downinput){
    downinput.addEventListener('focus', () => {
        downinput.classList.add('listening');
    });
    downinput.addEventListener('focusout', () => {
        downinput.classList.remove('listening');
    }
    );
}

if(rotateinput){
    rotateinput.addEventListener('focus', () => {
        rotateinput.classList.add('listening');
    });
    rotateinput.addEventListener('focusout', () => {
        rotateinput.classList.remove('listening');
    });
}

if(holdinput){
    holdinput.addEventListener('focus', () => {
        holdinput.classList.add('listening');
    });
    holdinput.addEventListener('focusout', () => {
        holdinput.classList.remove('listening');
    });
}

if(harddropinput){
    harddropinput.addEventListener('focus', () => {
        harddropinput.classList.add('listening');
    });
    harddropinput.addEventListener('focusout', () => {
        harddropinput.classList.remove('listening');
    });
}

function showSettings(){
    if(!buttonSettingsState){
        settings.classList.add('active');
        buttonSettingsState = true;
        if(getCookie('inputs')){
            inputs = JSON.parse(getCookie('inputs'));
            leftinput.value = inputs.left.value;
            rightinput.value = inputs.right.value;
            downinput.value = inputs.down.value;
            rotateinput.value = inputs.rotate.value;
            holdinput.value = inputs.hold.value;
            harddropinput.value = inputs.harddrop.value;
        }
    }
    else{
        settings.classList.remove('active');
        buttonSettingsState = false;
    }
}

function saveSettings(){
    showSettings();
    inputs.left.value = leftinput.value;
    inputs.right.value = rightinput.value;
    inputs.down.value =downinput.value;
    inputs.rotate.value = rotateinput.value;
    inputs.hold.value =holdinput.value;
    inputs.harddrop.value = harddropinput.value;
    setCookie('inputs', JSON.stringify(inputs), {secure: true, 'max-age': 3600});
    volume.music = musicinput.value /100;
    volume.sound = soundinput.value /100;
    background_music.volume = volume.music;
    for (const key in sounds) {
        sounds[key].volume = volume.sound;
     }
    setCookie('volume', JSON.stringify(volume), {secure: true, 'max-age': 3600});
}

function resetSettings(){
    inputs = reset_inputs;
    volume = reset_volume;
    deleteCookie('inputs');
    deleteCookie('volume');
    cancelSettings();
}

function cancelSettings(){
    leftinput.value = inputs.left.value;
    rightinput.value = inputs.right.value;
    downinput.value = inputs.down.value;
    rotateinput.value = inputs.rotate.value;
    holdinput.value = inputs.hold.value;
    harddropinput.value = inputs.harddrop.value;
    musicinput.value = volume.music*100;
    soundinput.value = volume.sound*100;
    showSettings();
}

document.addEventListener('keydown', function(e) {
    var input = document.querySelector('.listening');
    if(input.classList.contains('listening') && input.classList.contains('settings-input')){
        if(e.key == "Backspace"){
            input.value = "";
        }
        else{
            input.value = e.key;
        }
        
    }
    else{
        if(e.key == "Backspace"){
            --input.value;
        }
        else if(e.keyCode < 48 || e.keyCode > 105){
            return;
        }
        else{
            input.value += e.key;
        }
        
    }
    
  });

  document.addEventListener('keypress', (e) => {
    e.preventDefault();
  });
  