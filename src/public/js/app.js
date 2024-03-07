const socket = new WebSocket(`ws://${window.location.host}`); // to be, 서버와 연결할 소켓

// fe 소켓 연결 이벤트
socket.addEventListener('open', () => {
    console.log('소켓 연결 시작');
})

// fe 메세지 감지 이벤트
socket.addEventListener('message', (message) => {
    console.log('메세지: ', message.data);
})
ß
// fe 소켓 종료 이벤트
socket.addEventListener('close', () => {
    console.log('소켓 연결 종료');
})

setTimeout(()=>{

    // 이벤트 발생 -> 10번째 줄 message.data
    socket.send('hello from the browser!');
}, 1000)