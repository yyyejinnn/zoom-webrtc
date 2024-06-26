const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');

let myStream;
let muted = false;
let camereOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const cameras = devices.filter(device => device.kind === 'videoinput');
        const currCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.innerText = camera.label;

            if(currCamera.label === camera.label){
                option.selected = true;
            }
            
            camerasSelect.appendChild(option);
        })

    }catch(e){
        console.log(e);
    }
}

async function getMedia(deviceId){
    const initConstraints = {
        audio: true,
        video: { faceingMode: 'user' }
    };

    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } }
    };

    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initConstraints
        );

        myFace.srcObject = myStream;

        if (!deviceId){
            await getCameras();
        }
    }catch(e){
        console.log(e);
    }
}

function handleMuteClick(){
    // 실제 audio track 변경
    myStream
        .getAudioTracks()
        .forEach(track => track.enabled = !track.enabled);

    // btn 텍스트 변경
    if(!muted){
        muteBtn.innerText = 'Unmute';
        muted = true;
    } else {
        muteBtn.innerText = 'Mute';
        muted = false;
    }
}

function handleCameraClick(){
    // 실제 camera track 변경
    myStream
        .getVideoTracks()
        .forEach(track => track.enabled = !track.enabled);

    // btn 텍스트 변경
    if(camereOff){
        cameraBtn.innerText = 'Turn Camera Off';
        camereOff = false;
    } else {
        cameraBtn.innerText = 'Turn Camera On';
        camereOff = true;
    }
}

async function handleCameraChange(){
    const deviceId = camerasSelect.value;
    await getMedia(deviceId);   // 새로운 생성된 stream 반영 (myStream)
    
    /**
     * sender로 peer track 업데이트하기
     */
    if(myPeerConnection){
        // 변경된 나의 track 가져오기
        const videoTrack = myStream.getVideoTracks()[0];

        // peer stream 변경
        const videoSender = myPeerConnection
            .getSenders()
            .find(sender => sender.track.kind === 'video');
        
        videoSender.replaceTrack(videoTrack);
    }
}

muteBtn.addEventListener('click', handleMuteClick);
cameraBtn.addEventListener('click', handleCameraClick);
camerasSelect.addEventListener('input', handleCameraChange);


/**
 * Welcome Form (join a room)
 */

const welcome = document.getElementById('welcome');
const call = document.getElementById('call');
call.hidden = true;

const welcomeForm = welcome.querySelector('form');

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector('input');

    await initCall();
    socket.emit('join_room', input.value);

    roomName = input.value;
    input.value = '';
}

welcomeForm.addEventListener('submit', handleWelcomeSubmit);


/**
 * Chat Form - Data Channel
 */
const chat = document.getElementById('chat');
const chatForm = chat.querySelector('form');

async function handleChatSubmit(event){
    event.preventDefault();
    const input = chatForm.querySelector('input');

    myDataChannel.send(input.value);
    sendDataChannelMessage(`You: ${input.value}`);

    input.value = '';
}

chatForm.addEventListener('submit', handleChatSubmit);

function sendDataChannelMessage(message){
    const ul = chat.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = message;
    ul.appendChild(li);
}

/**
 * Socket Code
 */

// peer A
socket.on('welcome', async () => {
    // data channel - offer
    myDataChannel = myPeerConnection.createDataChannel('chat');
    myDataChannel.addEventListener('message', (event) => sendDataChannelMessage(event.data));

    // p2p
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);

    console.log('Peer-A sent the offer to Peer-B!');
    socket.emit('offer', offer, roomName);
})

// peer B
socket.on('offer', async (offer) => {
    // data channel - answer
    myPeerConnection.addEventListener('datachannel', (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener('message', (event) => sendDataChannelMessage(event.data));
    });

    // p2p
    myPeerConnection.setRemoteDescription(offer);

    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit('answer', answer, roomName);
})

socket.on('answer', (answer) => {
    myPeerConnection.setRemoteDescription(answer);
})

socket.on('ice', (ice) => {
    // recieve candidate
    myPeerConnection.addIceCandidate(ice);
})

/**
 * RTC code
 */

function handleIce(iceData){
    // send candidate
    socket.emit('ice', iceData.candidate, roomName);
}

function handleAddStream(data){
    // get an event from my peer

    const peerFace = document.getElementById('peerFace');
    peerFace.srcObject = data.streams[0];
}

function makeConnection(){
    // 1-1. p2p connection 생성
    myPeerConnection = new RTCPeerConnection({
        // STUN server
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                    ],
            }
        ]
    });
    myPeerConnection.addEventListener('icecandidate', handleIce);
    myPeerConnection.addEventListener('track', handleAddStream);

    // 1-2. stream p2p 연결
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));
    
}