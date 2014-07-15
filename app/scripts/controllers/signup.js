var SignupController = Ember.Controller.extend(Ember.Validations.Mixin, {
    validations:{
      username: {
        presence:true,
        length:{minimum:3}
      },
      email: {
        format: {
          with: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'must be a valid email'
        }
      },
      password: {
        length:{minimum:8},
        confirmation:true
      },
      passwordConfirmation: {
        presence:true
      }
    },
    actions: {
        signup: function() {
            var that = this;
            this.validate().then(function() {
                $.ajax({
                    type: 'POST',
                    url: '/signup',
                    context: that,
                    data: that.getProperties('username', 'email', 'password', 'passwordConfirmation')
                }).done(function() {
                    that.transitionToRoute('login');
                }).fail(function(xhr) {
                    that.set('errorMessage', xhr.responseText);
                });
            }, function() {
                var errors = that.get('errors');
                var fullErrors = [];
                Object.keys(errors).forEach(function(val) {
                    if (errors[val] instanceof Array)
                        errors[val].forEach(function(msg) {
                            fullErrors.push([val, msg].join(" "));
                        });
                });
                that.set('fullErrors', fullErrors);
            });
        }
    }
});

module.exports = SignupController;
