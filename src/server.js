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

server.listen(3000, handleListen);