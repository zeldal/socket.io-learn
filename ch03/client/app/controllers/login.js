import Ember from 'ember';
import UserModel from 'client/models/user';


export default Ember.Controller.extend({
    startService: function () {

    },
    actions: {
        login: function () {
            var self = this;
            /*            UserModel.setUserModel(this.get("model")).then(function () {
             return self.transitionToRoute("anasayfa");
             });*/
            UserModel.login(this.get("model")).then(function (resp) {
                console.log("Response:" + resp);
                return self.transitionToRoute("anasayfa");

            }, function (error) {
                alert('Bir hata oluştu: ' + error);
            });
        }
    }
});
