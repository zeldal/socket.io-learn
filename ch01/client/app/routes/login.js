import Ember from 'ember';
import UserModel from 'client/models/user';

export default Ember.Route.extend({
    model: function () {
        return UserModel.getUserModel();
    }
});
