import Ember from 'ember';

export default Ember.Controller.extend({
    publicMessageElements: Ember.ArrayController.create({sortProperties: ['timestamp']}),
    userList: Ember.ArrayController.create({sortProperties: ['status']}),
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
        this.socket.on('login', function (data) {
            self.set("connected",true);
            var message = "Welcome to Socket.IO Chat – ";
            self.set("numUsers",data.numUsers);
            if(data.usernames)
                Ember.keys(data.usernames).forEach(function(username){
                    self.userList.pushObject(Ember.Object.create({
                        username:username
                    }));
                });
            self.log(message, new Date().getTime());
        });

        this.socket.on('new message', function (data) {
            self.log(data.message, data.timestamp,data.sender);
        });

        this.socket.on('user joined', function (data) {
            self.log(data.username + ' joined',data.timestamp);
            self.userList.pushObject(Ember.Object.create({
                username:data.username
            }));
        });

        this.socket.on('user left', function (data) {
            self.log(data.username + ' left',data.timestamp);
        });

        this.socket.on('typing', function (data) {
            //addChatTyping(data);
        });

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
