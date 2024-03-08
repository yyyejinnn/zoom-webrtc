import express from 'express';
import http from 'http';
import socketIO from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => res.render('home'));
// app.get('/*', (_, res) => res.render('/'));

// socketIO
const server = http.createServer(app);
const ioServer = socketIO(server);

function publicRooms(){
    const { sids, rooms } = ioServer.sockets.adapter;

    // console.log(sids);
    // console.log(rooms);

    return [...rooms.keys()].filter(room => !sids.has(room));
}

function countRoom(roomName){
    const { rooms } = ioServer.sockets.adapter;

    return rooms.get(roomName)?.size;å
}

ioServer.on('connection', socket => {
    ioServer.sockets.emit('room_change', publicRooms());
    socket['nickname'] = 'Anon';

    /**
     * socket.join()
     * 여기서 room이란 채팅에 국한되지않음
     * -> 배민 주문을 하면 배달원과 나 사이의 'room'이 그룹핑 되는 것
     */
    socket.on('enter_room', (roomName, nickName, fn) => {
        socket.join(roomName);
        socket['nickname'] = nickName;
        fn();
        
        socket.to(roomName).emit('welcome', socket['nickname'], countRoom(roomName));    // 나를 제외한 방 안의 모든 이에게 이벤트 적용
        ioServer.sockets.emit('room_change', publicRooms());
    })

    socket.on('save_nickname', (nickname) => socket['nickname'] = nickname);

    socket.on('send_message', (message, room, fn) => {
        socket.to(room).emit('get_sending_message', message, socket['nickname']);
        fn();
    })

    socket.on('disconnecting', () => {
        /**
         * socket.to(roomName).emit('') vs. socket.rooms.forEach(r => socket.to(r).emit())
         * -> 둘 다 전체 발송 아니야? 라고 생각하지만 차이가 있다.
         * -> 전자는 roonName, 특정 방에 대한 전체 발송이고 후자는 한 소켓 안에서의 전체 발송
         */
        socket.rooms.forEach(room => socket.to(room).emit('bye', socket['nickname'], countRoom(room)-1));
    })

    socket.on('disconnect', () => ioServer.sockets.emit('room_change', publicRooms()));
});

const handleListen = () => console.log('Listening on http://localhost:3000');
server.listen(3000, handleListen);