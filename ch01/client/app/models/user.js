var userModel = Ember.Object.extend({
    username:"",
    password:""
});
var staticUserModel = userModel.create();
if (localStorage.user)
    staticUserModel = userModel.create(JSON.parse(localStorage.user));

userModel.reopenClass({
    getUserModel: function(){
        return Ember.RSVP.resolve(staticUserModel);

    },
    setUserModel: function(user){
        return Ember.RSVP.resolve( (localStorage.user = JSON.stringify(user)));
   }
});

export default userModel;