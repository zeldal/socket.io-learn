var userModel = Ember.Object.extend({
    username:"",
    password:""
});
var staticUserModel = userModel.create();
if (sessionStorage.user)
    staticUserModel = userModel.create(JSON.parse(sessionStorage.user));

userModel.reopenClass({
    getUserModel: function(){
        return Ember.RSVP.resolve(staticUserModel);

    },
    setUserModel: function(user){
        return Ember.RSVP.resolve( (sessionStorage.user = JSON.stringify(user)));
   }
});

export default userModel;