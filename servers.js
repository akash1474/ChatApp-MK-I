const express = require('express');
const { generateMessage, getAllChats } = require('./utils/message');
const { createUser, getCurrentUser, deleteUser, activeUsers } = require('./utils/users');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION Shutting Down!!'), console.log(err);
    process.exit(1);
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
