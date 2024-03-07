import express from 'express';
import http from 'http';
import ws from 'ws';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.render('/'));


// http
const handleListen = () => console.log('Listening on http://localhost:3000');
// app.listen(3000, handleListen);


// ws
const server = http.createServer(app);
const wss = new ws.WebSocketServer({ server });

/**
 * wss vs. socket
 * wss.on()은 서버 전체를 위한 소켓 서버 관리
 * socket.on()은 특정 소켓 단위로 관리
 */

const sockets = [];

wss.on('connection', (socket) => { // from fe, 연결된 브라우저
    console.log('서버 연결 시작');

    // fe로부터 받아온 message 감지
    // socket.on('message', message => console.log(message.toString('utf-8')));
    // socket.on('message', (message) => socket.send(message.toString()));

    sockets.push(socket);
    socket['nickname'] = 'anon';

    socket.on('message', (message) => {
        const msgObj = JSON.parse(message.toString());

        const msgType = msgObj.type;
        const msgPayload = msgObj.payload.toString();

        switch(msgType){
            case 'message': {
                sockets.forEach(aSocket => {
                    aSocket.send(`${socket['nickname']}: ${msgPayload}`)
                });
                break;
            }
            case 'nickname': {
                socket['nickname'] = msgPayload;
            }
        }
    })

    // be 소켓 연결 종료
    socket.on('close', ()=> console.log('서버 연결 종료'));
})

server.listen(3000, handleListen);