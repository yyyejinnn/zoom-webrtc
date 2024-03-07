const messageList = document.querySelector('ul');
const nickForm = document.querySelector('#nick')
const messageForm = document.querySelector('#message');

const socket = new WebSocket(`ws://${window.location.host}`); // to be, 서버와 연결할 소켓

/**
 * object로 바로 보내면 편할텐데.. string type으로 보내게 만들어진 이유는?
 * -> be가 js가 아닌 다른 언어를 사용할 경우도 고려해야함
 * -> 파라미터에 대한 처리는 백엔드에서 처리할 수 있도록 의존성X
 */
function makeMessage(type, payload){
    const msg = {type, payload};

    return JSON.stringify(msg);
}

// fe 소켓 연결 이벤트
socket.addEventListener('open', () => {
    console.log('소켓 연결 시작');
})

// fe 메세지 감지 이벤트
socket.addEventListener('message', (message) => {
    // console.log('메세지: ', message.data);

    const li = document.createElement('li');
    li.innerText = message.data;
    messageList.append(li);
})

// fe 소켓 종료 이벤트
socket.addEventListener('close', () => {
    console.log('소켓 연결 종료');
})

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector('input');
    socket.send(makeMessage('message', input.value));
    input.value = '';

}

function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector('input');
    socket.send(makeMessage('nickname', input.value));
    input.value = '';
}

messageForm.addEventListener('submit', handleSubmit);
nickForm.addEventListener('submit', handleNickSubmit);


//setTimeout(()=>{
//
//    // 이벤트 발생 -> 10번째 줄 message.data
//    socket.send('hello from the browser!');
//}, 1000)