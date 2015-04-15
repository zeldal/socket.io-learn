import Ember from 'ember';

export default Ember.Route.extend({
    afterModel: function () {
        this.controllerFor("anasayfa").startService();
    }
});
