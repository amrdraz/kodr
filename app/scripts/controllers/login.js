var LoginController = Ember.Controller.extend(SimpleAuth.LoginControllerMixin, Ember.Validations.Mixin, {
    authenticator: 'simple-auth-authenticator:oauth2-password-grant',
    validations: {
        identification: {
            presence: true,
            length: {
                minimum: 4
            }
        },
        password: {
            presence: true,
            length: {
                minimum: 10
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
        authenticate: function() {
            var _this = this;
            this._super().then(null, function(error) {
              _this.set('errorMessage', error);
            });
          }
    }
});

module.exports = LoginController;
