// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 4100;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/../client/dist'));

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;
    console.log("User is connected:");
    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        console.log("new Message:"+JSON.stringify(data));
        io.emit('new message', {
            sender: socket.username,
            message: data.message,
            timestamp:data.timestamp
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        console.log("add user:"+username);
        // we store the username in the socket session for this client
        socket.username = username;
        // add the client's username to the global list
        usernames[username] = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers,
            usernames:usernames
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            timestamp: new Date().getTime(),
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                timestamp: new Date().getTime(),
                numUsers: numUsers
            });
        }
    });
});