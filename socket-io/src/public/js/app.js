const socket = io();

const welcome = document.getElementById('welcome');
const form = document.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector('input');

    /** socket.emit(): https://socket.io/docs/v4/server-api/#serveremiteventname-args
     * server.js socket.on('enter_room', fn)
     * websocket과 달리 object 인수도 가능!
     * 
     * 콜백 함수도 전달 가능
     * -> 가장 마지막에 위치해야함
     * -> be에서 실행되는게 아닌 be으로부터 fe함수를 실행시키는 것
     * 
     */

    roomName = input.value;

    socket.emit('enter_room', roomName, showRoom);
    input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);

/** */
function addMessage(msg){
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = msg;
    ul.appendChild(li);
}

socket.on('welcome', () => {
    addMessage('Someone joined!');
})