import express from 'express';
import http from 'http';
import socketIO from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => res.render('home'));
// app.get('/*', (_, res) => res.render('/'));


const server = http.createServer(app);
const ioServer = socketIO(server);

let receiverPCs = {};
let senderPCs = {};
let users = {};         // { [roomId] : Array<{id: number}> }
let socketToRoom = {};

function getOtherUsersInRoom(socketId, roomId){
    return users[roomId].filter(user => user.id !== socketId);
}

ioServer.on('connection', socket => {
    socket.on('user_enter', (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit('user_enter');
    });

    socket.on('offer', (offer, roomName) => {
        socket.to(roomName).emit('received_offer', offer);
    });

    socket.on('answer', (answer, roomName) => {
        socket.to(roomName).emit('received_answer', answer);
    });

    socket.on('ice', (ice, roomName) => {
        socket.to(roomName).emit('ice', ice);
    });
})


const handleListen = () => console.log('Listening on http://localhost:3000');
server.listen(3000, handleListen);