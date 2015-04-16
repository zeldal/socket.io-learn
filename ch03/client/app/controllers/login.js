import Ember from 'ember';
import UserModel from 'client/models/user';


export default Ember.Controller.extend({
    startService: function(){

    },
    actions:{
        login: function(){
            var self = this;
            UserModel.setUserModel(this.get("model")).then(function () {
                return self.transitionToRoute("anasayfa");
            });
        }
    }
});
