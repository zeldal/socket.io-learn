import Ember from 'ember';

export default Ember.Controller.extend({
    publicMessageElements: Ember.ArrayController.create({sortProperties: ['timestamp']}),
    connected : false,
    message: "",
    log: function (msg, timestamp, sender) {
        var messageElement = Ember.Object.create({
            message: msg,
            timestamp: timestamp,
            datetime: new Date(timestamp),
            sender: sender
        });
        console.log(JSON.stringify(messageElement));

        this.publicMessageElements.pushObject(messageElement);
    },

    startService: function(user){
        this.socket = io();
        var self = this;
        // Whenever the server emits 'login', log the login message
        this.socket.on('login', function (data) {
            self.set("connected",true);
            // Display the welcome message
            var message = "Welcome to Socket.IO Chat – ";
            self.log(message, new Date().getTime());
            //addParticipantsMessage(data);
        });

        // Whenever the server emits 'new message', update the chat body
        this.socket.on('new message', function (data) {
            self.log(data.message, data.timestamp,data.sender);
        });

        // Whenever the server emits 'user joined', log it in the chat body
        this.socket.on('user joined', function (data) {
            self.log(data.username + ' joined',data.timestamp);
        });

        // Whenever the server emits 'user left', log it in the chat body
        this.socket.on('user left', function (data) {
            self.log(data.username + ' left',data.timestamp);
        });

        // Whenever the server emits 'typing', show the typing message
        this.socket.on('typing', function (data) {
            //addChatTyping(data);
        });

        // Whenever the server emits 'stop typing', kill the typing message
        this.socket.on('stop typing', function (data) {
            //removeChatTyping(data);
        });
        this.socket.emit('add user', user.get("username"));
    },
    actions: {
        sendPublicMessage: function(){
            var message = this.get("message");
            this.socket.emit("new message",{
                message:message,
                timestamp:new Date().getTime(),
                sender: this.get("model.username")

            });
            this.set("message");
        }
    }
});
