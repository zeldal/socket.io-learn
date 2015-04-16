// Setup basic express server
var express = require('express');
var session = require('express-session');
var cookie = require("cookie");
var winston = require("winston");
var bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 4101;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/../client/dist'));

var sessionStore = new session.MemoryStore();
var sessionIns = session({
    secret: 'keyboard cat',
    resave: false,
    name: 'sid',
    saveUninitialized: true,
    store: sessionStore,
    cookie: {httpOnly: true}
});
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(sessionIns);
app.post('/api/login', function (request, response) {
    winston.log("warn", "Request Body: " + (JSON.stringify(request.body)) + " ");
    return request.session.regenerate(function(sessionError) {
        if (sessionError === null || typeof(sessionError) === 'undefined') {
            request.session.isAuthenticated = true;
            request.session.username = request.body.username;
            request.session.clientIp = request.ip;
            response.setHeader('Content-Type', 'application/json; charset=UTF-8');
            return response.end(JSON.stringify(request.body));
        } else {
            winston.log("error", "Invalid Session Generation: " + (JSON.stringify(sessionError)) + " ");
            response.writeHead(401);
            return response.end('Invalid Session Generation');
        }
    });
});
// Chatroom

// usernames which are currently connected to the chat
var usernames = {};

var setInvalidSession = function(socket, next, message) {
    winston.warn("Invalid setInvalidSession");
    socket.emit('401', message);
    return next(new Error(message));
};

io.use(function(socket, next){
    var _cookies, _sid;
    winston.debug("IO.Use:" + socket.request.headers.cookie);
    if (socket.request.headers.cookie) {
        _cookies = cookie.parse(socket.request.headers.cookie);
        if (_cookies['sid']) {
            _sid = cookieParser.signedCookie(_cookies['sid'], 'keyboard cat');
            return sessionStore.get(_sid, function(err, session) {
                if (err || !session) {
                    winston.warn("InvalidSession: Cookie store has no sid:" + _sid);
                    return setInvalidSession(socket, next, "Authentication error:InvalidSession: Cookie store has no sid");
                }
                session.save = function(fn) {
                    sessionStore.set(_sid, this, fn || function() {});
                };
                socket.session = session;
                winston.debug("Now Socket Has Session:" + JSON.stringify(session));
                next();
            });
        } else {
            winston.warn("InvalidSession: Header has no Cookie named:" + options.name);
            return setInvalidSession(socket, next, "Authentication error: InvalidSession: Header has no Cookie");
        }
    } else {
        winston.warn("InvalidSession: Header has no Cookie");
        return setInvalidSession(socket, next, "Authentication error: InvalidSession: Header has no Cookie");
    }
});


var numUsers = 0;



io.on('connection', function (socket) {
    var addedUser = false;
    console.log("User is connected:"+JSON.stringify(socket.session));
    // when the client emits 'new message', this listens and executes
    if(!(socket.session && socket.session.isAuthenticated) ){
        console.log("No Session user is going to dc");
        return socket.disconnect('unauthorized');
    }

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