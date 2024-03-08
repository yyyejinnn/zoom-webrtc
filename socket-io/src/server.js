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

ioServer.on('connection', socket => {
    /**
     * socket.join()
     * 여기서 room이란 채팅에 국한되지않음
     * -> 배민 주문을 하면 배달원과 나 사이의 'room'이 그룹핑 되는 것
     */
    socket.on('enter_room', (roomName, fn) => {
        socket.join(roomName);
        fn();
        socket.to(roomName).emit('welcome');    // 나를 제외한 방 안의 모든 이에게 이벤트 적용
    })
});

const handleListen = () => console.log('Listening on http://localhost:3000');
server.listen(3000, handleListen);