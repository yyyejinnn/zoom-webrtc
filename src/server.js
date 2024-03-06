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

wss.on('connection', (socket) => { // from fe, 연결된 브라우저
    // console.log(socket);

    console.log('서버 연결 시작');
    socket.on('message', message => console.log(message.toString('utf-8')));
    socket.on('close', ()=> console.log('서버 연결 종료'));

    // socket.send('hello!!!');
})

server.listen(3000, handleListen);