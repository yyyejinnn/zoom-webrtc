import express from 'express';
import http from 'http';
import socketIO from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.render('/'));


// socketIO
const server = http.createServer(app);
const ioServer = socketIO(server);

ioServer.on('connection', socket => {
    socket.on('enter_room', (msg, fn) => {
        console.log(msg);    // { payload: <value> }
        setTimeout(() => fn(), 3000);
    })
});

const handleListen = () => console.log('Listening on http://localhost:3000');
server.listen(3000, handleListen);