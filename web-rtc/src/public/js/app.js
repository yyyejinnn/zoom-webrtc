// const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');

let myStream;
let muted = false;
let camereOff = false;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const cameras = devices.filter(device => device.kind === 'videoinput');
        cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.innerText = camera.label;
            
            camerasSelect.appendChild(option);
        })

    }catch(e){
        console.log(e);
    }
}

async function getMedia(){
    try{
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        // console.log(myStream);

        myFace.srcObject = myStream;

        await getCameras();
    }catch(e){
        console.log(e);
    }
}

getMedia();

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

muteBtn.addEventListener('click', handleMuteClick);
cameraBtn.addEventListener('click', handleCameraClick);