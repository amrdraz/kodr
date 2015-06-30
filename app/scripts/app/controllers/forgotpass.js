import toastr from '/kodr/'toastr'';
import Ember from 'ember';


module.exports = Ember.Controller.extend(SimpleAuth.LoginControllerMixin, Ember.Validations.Mixin, {
    authenticator: 'simple-auth-authenticator:oauth2-password-grant',
    validations: {
        identification: {
            presence: true,
            length: {
                minimum: 4
            }
        }
    },
    actions: {
        validate: function() {

            var that = this;
            return this.validate().then(function() {
                Ember.$.ajax({
                    type: 'POST',
                    url: '/api/users/forgotpass',
                    context: that,
                    data: that.getProperties('identification')
                }).done(function(data) {
                    console.log(data);
                    toastr.success("Email sent");
                }).fail(function(xhr) {
                    that.set('errorMessage', xhr.responseText);
                });
            }, function() {
                var errors = that.get('errors');
                var fullErrors = [];
                Object.keys(errors).forEach(function(val) {
                    if(errors[val] instanceof Array)
                        errors[val].forEach(function(msg) {
                            fullErrors.push([val, msg].join(" "));
                        });
                });
                that.set('fullErrors',fullErrors);
            });
        }
    }
});

export default undefined;
