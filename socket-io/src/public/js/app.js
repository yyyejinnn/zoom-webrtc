const socket = io();

const welcome = document.getElementById('welcome');
const form = document.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;
let nickName;

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector('#msg input');

    const msg = input.value;
    socket.emit('send_message', msg, roomName, () => addMessage(`You: ${msg}`));
    input.value = '';
}

// function handleNicknameSubmit(event){
//     event.preventDefault();
//     const input = room.querySelector('#nick input');

//     const nickname = input.value;
//     socket.emit('save_nickname', nickname);
//     input.value = '';

// }

function changeH3CountRoom(count){
    const h3 = room.querySelector('h3');

    const base =  `Room: ${roomName}`;

    h3.innerText = count ? base + ` (${count})` : base;
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;

    changeH3CountRoom();

    const h5 = room.querySelector('h5');
    h5.innerText = `NickName: ${nickName}`;

    const msgForm = room.querySelector('#msg');
    msgForm.addEventListener('submit', handleMessageSubmit);
}

function handleRoomSubmit(event){
    event.preventDefault();

    const nickNameInput = document.getElementById('nickname');
    const roomNameInput = document.getElementById('roomname');

    /** socket.emit(): https://socket.io/docs/v4/server-api/#serveremiteventname-args
     * server.js socket.on('enter_room', fn)
     * websocket과 달리 object 인수도 가능!
     * 
     * 콜백 함수도 전달 가능
     * -> 가장 마지막에 위치해야함
     * -> be에서 실행되는게 아닌 be으로부터 fe함수를 실행시키는 것
     * 
     */

    roomName = roomNameInput.value;
    nickName = nickNameInput.value;

    socket.emit('enter_room', roomName, nickName, showRoom);

    roomNameInput.value = '';
    nickNameInput.value = '';
}

form.addEventListener('submit', handleRoomSubmit);

/** */
function addMessage(msg){
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = msg;
    ul.appendChild(li);
}

socket.on('welcome', (nickname, count) => {
    changeH3CountRoom(count);
    addMessage(`${nickname} joined!`);
})

socket.on('bye', (nickname, count) => {
    changeH3CountRoom(count);
    addMessage(`${nickname} left!`);
})

socket.on('get_sending_message', (msg, nickname) => addMessage(`${nickname}: ${msg}`)); // (message) => addMessage(message)와 동일 -> 인수 생략 가능

socket.on('room_change', (rooms) => {
    const roomList = welcome.querySelector('ul');
    roomList.innerHTML = '';

    if (rooms.lenth === 0){
        return;
    }

    rooms.forEach(room => {
        const li = document.createElement('li');
        li.innerText = room;
        roomList.append(li);
    })
});