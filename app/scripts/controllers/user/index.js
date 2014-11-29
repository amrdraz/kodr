var UserController = Ember.ObjectController.extend(Ember.Validations.Mixin, {
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
    activitySeries: function() {
        return [{
            name: 'Quantity',
            data: [4, 4]
        }, {
            name: 'Revenue',
            data: [10.0, 10.0]
        }];
    }.property(),
    isOwnPage: function() {
        return this.get('session.user.id') === this.get('model.id');
    }.property('model.id'),
    actions: {
        changePass: function() {
            var that = this;
            this.validate().then(function() {
                if (that.get('session.isAdmin')) {
                    Em.$.ajax({
                        type: 'PUT',
                        url: '/api/users/' + that.get('model.id'),
                        context: that,
                        data: {
                            user: that.get('model').getProperties('password', 'passwordConfirmation')
                        }
                    }).done(function(res) {
                        toastr.success('passwordChanged');
                        that.set('session.access_token',res.access_token);
                        that.get('model').setProperties({
                            password: '',
                            passwordConfirmation: ''
                        });
                    }).fail(function(xhr) {
                        toastr.error(xhr.responseText);
                    });
                } else {
                    Em.$.ajax({
                        type: 'PUT',
                        url: '/profile',
                        context: that,
                        data: {
                            user: that.get('model').getProperties('password', 'passwordConfirmation')
                        }
                    }).done(function(res) {
                        toastr.success('passwordChanged');
                        that.set('session.access_token',res.access_token);
                        that.get('model').setProperties({
                            password: '',
                            passwordConfirmation: ''
                        });
                    }).fail(function(xhr) {
                        toastr.error(xhr.responseText);
                    });
                }
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

module.exports = UserController;
