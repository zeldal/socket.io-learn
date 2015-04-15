import Ember from 'ember';

export default Ember.Controller.extend({
    log: function (msg) {
        console.log(msg)
    },

    startService: function(){
        var socket = io();
        var self = this;
        // Whenever the server emits 'login', log the login message
        socket.on('login', function (data) {
            connected = true;
            // Display the welcome message
            var message = "Welcome to Socket.IO Chat – ";
            self.log(message, {
                prepend: true
            });
            //addParticipantsMessage(data);
        });

        // Whenever the server emits 'new message', update the chat body
        socket.on('new message', function (data) {
            //addChatMessage(data);
        });

        // Whenever the server emits 'user joined', log it in the chat body
        socket.on('user joined', function (data) {
            self.log(data.username + ' joined');
            //addParticipantsMessage(data);
        });

        // Whenever the server emits 'user left', log it in the chat body
        socket.on('user left', function (data) {
            self.log(data.username + ' left');
            //addParticipantsMessage(data);
            //removeChatTyping(data);
        });

        // Whenever the server emits 'typing', show the typing message
        socket.on('typing', function (data) {
            //addChatTyping(data);
        });

        // Whenever the server emits 'stop typing', kill the typing message
        socket.on('stop typing', function (data) {
            //removeChatTyping(data);
        });
    }
});
