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


const handleListen = () => console.log('Listening on http://localhost:3000');
server.listen(3000, handleListen);