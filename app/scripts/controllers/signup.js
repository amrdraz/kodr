var SignupController = Ember.Controller.extend(Ember.Validations.Mixin, {
    validations:{
      username: {
        presence:true,
        length:{minimum:3},
        format:{
          with:/^\w[\w.-\d]{3,}$/,
          message: 'username can only be composed of alphabet, digits, _ and -'
        }
      },
      email: {
        format: {
          with: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'you need to provide a GUC email'
        }
      },
      password: {
        length:{minimum:10},
        format:{
          with:/^.{10,}$/,
          message: 'must contain at least one alphabel character and one digit'
        },
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
