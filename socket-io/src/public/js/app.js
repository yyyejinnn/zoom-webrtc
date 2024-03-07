const socket = io();

const welcome = document.getElementById('welcome');
const form = document.querySelector('form');

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
     */
    socket.emit('enter_room', { payload: input.value }, () => console.log('server is done!'));
    input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);