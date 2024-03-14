const socket = io();

const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');

let myStream;
let myPeerConnection;
let receiverPcs;

let roomName;


/**
 * Welcome Form
 */

const welcome = document.getElementById('welcome');
const call = document.getElementById('call');
call.hidden = true;

const welcomeForm = welcome.querySelector('form');
const myFace = document.getElementById('myFace');

async function getMedia(){
    myStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
            width: 240,
            height: 240,
        },
    });

    myFace.srcObject= myStream;
}

function handleIce(iceData){
    socket.emit('ice', iceData.candidate, roomName);
}

function handleAddStream(data){
    const peerFace = document.getElementById('peerFace');
    
    console.log(data);
    peerFace.srcObject = data.streams[0];
}

function makeConnection(){
    const pcConfig = {
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
    };

    myPeerConnection = new RTCPeerConnection(pcConfig);

    myPeerConnection.addEventListener('icecandidate', handleIce);
    myPeerConnection.addEventListener('track', handleAddStream);

    myStream
    .getTracks()
    .forEach(track => myPeerConnection.addTrack(track, myStream));
}

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;

    await getMedia();
    makeConnection();
}

async function handleEnterRoom(event) {
    event.preventDefault();
    
    const input = welcomeForm.querySelector('input');
    roomName = input.value;

    await initCall();
    socket.emit('user_enter', roomName);

    input.value = '';
}

welcomeForm.addEventListener('submit', handleEnterRoom);


/**
 * Socket 
 */

socket.on('user_enter', async () => {   // peer A

    // create offer
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);

    socket.emit('offer', offer, roomName);
});

socket.on('received_offer', async (offer) => {   // peer B
    console.log('received_offer')
    myPeerConnection.setRemoteDescription(offer);

    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    
    socket.emit('answer', answer, roomName);
});

socket.on('received_answer', (answer) => {       // peer A
    console.log('received_answer')

    myPeerConnection.setRemoteDescription(answer);
});

socket.on('ice', (ice) => {
    console.log('recieve candidate');
    myPeerConnection.addIceCandidate(ice);
});