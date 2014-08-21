var LoginController = Ember.Controller.extend(SimpleAuth.LoginControllerMixin, Ember.Validations.Mixin, {
    authenticator: 'simple-auth-authenticator:oauth2-password-grant',
    validations: {
        identification: {
            presence: true,
            length: {
                minimum: 3
            }
        },
        password: {
            presence: true,
            length: {
                minimum: 8
            }
        }
    },
    actions: {
        validate: function() {

            var that = this;
            return this.validate().then(function() {
                that.send('authenticate');
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
        },
        loginFailed: function(xhr) {
            this.set('errorMessage', xhr.responseText);
        }
    }
});

module.exports = LoginController;
