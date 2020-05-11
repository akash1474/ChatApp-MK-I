const express = require('express');
const { generateMessage, getAllChats } = require('./utils/message');
const { createUser, getCurrentUser, deleteUser, activeUsers } = require('./utils/users');
const multer = require('multer');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION Shutting Down!!'), console.log(err);
    process.exit(1);
});

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname.slice(0, 10)}.${file.mimetype.split('/')[1]}`);
    },
});

app.post('/uploads', multer({ storage: multerStorage }).single('file'), (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'File Uploaded Successfully ✔✔✔',
    });
});

app.get('/uploads/:filename', (req, res) => {
    console.log(req.params.filename);
    const readStream = fs.createReadStream(path.join(__dirname, 'uploads', req.params.filename), 'utf-8');
    readStream.pipe(res);
});

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        const user = createUser(socket.id, data);
        const chats = getAllChats();
        socket.emit('oldMessages', chats);
        socket.emit('welcome', 'Welcome');

        socket.broadcast.emit('welcome', `${user.username} has joined the chat!!!`);
        const live = activeUsers();
        io.emit('liveUsers', live);
    });
    socket.on('file', (data) => {
        console.log(data);
        socket.broadcast.emit('uploadedFile', data);
    });
    // socket.broadcast.emit('welcome', generateMessage('A user has joined the chat!!!', 'Admin'));
    socket.on('sentMessage', (data) => {
        io.emit('message', generateMessage(data.msg, data.username));
    });
    socket.on('disconnect', () => {
        const user = deleteUser(socket.id);
        const live = activeUsers();
        io.emit('liveUsers', live);
        socket.broadcast.emit('welcome', `${user.username} has left the chat!!!`);
    });
});
const port = process.env.NODE_ENV || 3000;

server.listen(port, () => {
    console.log(`Server running at PORT:${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION Shutting Down!!'), console.log(err);
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log(`SIGTERM RECEIVED`);
    server.close(() => {
        console.log('Process terminated!!!');
    });
});
