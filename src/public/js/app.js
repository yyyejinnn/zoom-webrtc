const socket = new WebSocket(`ws://${window.location.host}`); // to be, 서버와 연결할 소켓

socket.addEventListener('open', () => {
    console.log('소켓 연결 시작');
})

socket.addEventListener('message', (message) => {
    console.log('메세지: ', message.data);
})

socket.addEventListener('close', () => {
    console.log('소켓 연결 종료');
})

setTimeout(()=>{
    socket.send('hello from the browser!');
}, 1000)