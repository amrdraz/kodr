var toastr = require('toastr');
var SignupController = Ember.Controller.extend(Ember.Validations.Mixin, {
    validations:{
      username: {
        presence:true,
        length:{minimum:3},
        format:{
          with:/^\w[\w\.\-\d]{3,}$/,
          message: 'username can only be composed of alphabet, digits, _ and -'
        }
      },
      email: {
        presence:true,
        format: {
          with: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'you need to provide a GUC email'
        }
      },
      uniId: {
        format: {
          with:/^\d\d-\d{3,5}$/,
          message: 'must enter a valid uni id eg. 13-1233'
        }
      },
      password: {
        length:{minimum:8},
        format:{
          with:/^.{8,}$/,
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
                that.set('errorMessage','');
                $.ajax({
                    type: 'POST',
                    url: '/signup',
                    context: that,
                    data: that.getProperties('username', 'email', 'password', 'uniId','passwordConfirmation')
                }).done(function(res) {
                    toastr.success(res);
                    that.transitionToRoute('login', {queryParams:{email:that.get('email')}});
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
