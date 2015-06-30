import toastr from '/kodr/'toastr'';
import Ember from 'ember';


module.exports = Ember.Controller.extend(Ember.Validations.Mixin, {
    // needs: ['group'],
    breadCrumb: 'user',
    breadCrumbPath: 'user',
    validations: {
        password: {
            length: {
                minimum: 8
            },
            format: {
                with: /^.{8,}$/,
                message: 'must contain at least one alphabel character and one digit'
            },
            confirmation: true
        },
        passwordConfirmation: {
            presence: true
        }
    },
    isCreating: function() {
        return get('currentPath').split('.').contains('create');
    }.property('currentPath'),
    isCreatingOrNotAdmin:function () {
      return this.get('isCreating') || !this.get('model.isAdmin');
    }.property('isCreating','isAdmin'),
    actions: {
        save: function() {
            var that = this;
            var model = this.get('model');
            if (this.get('isCreating')) {
                model.save().then(function(user) {
                    that.transitionTo('user.edit', user);
                }, function(xhr) {
                    console.error(xhr.message);
                    toastr.error(xhr.message);
                });
            } else {
               return model.save();
            }
        },
        activate: function() {
          Ember.$.post('api/users/'+this.get('model.id')+'/verify').done(function (res) {
              toastr.success(res.message);
          }).fail(function (xhr) {
              toastr.error(xhr.responseText);
          });
        },
        delete: function() {
            this.get('model').destroyRecord();
            this.transitionToRoute('users');
        },
        changePass: function() {
            var that = this;
            this.validate().then(function() {
                Ember.$.ajax({
                    type: 'PUT',
                    url: '/api/users/' + that.get('model.id'),
                    context: that,
                    data: {
                        user: that.get('model').getProperties('password', 'passwordConfirmation')
                    }
                }).done(function(res) {
                    toastr.success('passwordChanged');
                    that.set('session.access_token', res.access_token);
                    that.get('model').setProperties({
                        password: '',
                        passwordConfirmation: ''
                    });
                }).fail(function(xhr) {
                    toastr.error(xhr.responseText);
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

export default undefined;
