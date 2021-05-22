const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { Server } = require('socket.io');
const io = new Server( server, { cors : { origin : '*' } } );

var users = []; // array of users

//https://socket.io/get-started/chat

app.get('/', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user has been connected')
    // console.log(socket.client.id)// client id
    // console.log(socket.id) // id from user socket
    socket.on('disconnect', () => {
        console.log('an user has been disconnected');
    });

    socket.on('{message}', (msg) => {
        let user = users.filter(u => u.id === socket.id);
        
        msg = `message from ${user[0].user} ` + msg.split('{message}')[1].trim();
        //socket.broadcast.emit('olá');// emit message to all except for sender
        //io.emit('{response}', msg);// emit message for all users connected 
        socket.broadcast.emit('{response}', msg);
    });

    socket.on('{user}', uname => {
        let tmp = {
            user: uname,
            id: socket.id // get user socket id (client)
        }

        users.push(tmp);
        // when a new user is connected send message to all users on current room
        socket.broadcast.emit('{response}',`user ${tmp.user} entered...`);
        console.log(users,' user list');
    });

    socket.on('{message-for}', text => {
        let sender = users.filter(u => u.id === socket.id);       
        let userNameFromMessage = text.split('{message-for}')[1].split(',')[0].trim();
        let message = `message from: ${sender[0].user}, [${text.split(',')[1]}]`;
        let user = '';
        
        for (let u of users) {
            if (u.user.includes(userNameFromMessage)) {
                console.log(u)
                user = u;
            }
        }        
        //console.log(user.id)
        io.to(user.id).emit('{message-from}',message);
    })
});

server.listen(3000, () => {
    console.log('server on http://127.0.0.1:3000'); // server address
});