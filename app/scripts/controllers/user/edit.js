module.exports = Em.ObjectController.extend(Ember.Validations.Mixin,{
    // needs: ['group'],
    breadCrumb: 'user',
    breadCrumbPath: 'user',
    validations:{
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
    isCreating: function () {
        return App.get('currentPath').split('.').contains('create');
    }.property('App.currentPath'),
    actions: {
        save:function () {
            this.get('model').save();
        },
        activate:function () {
            
        },
        delete:function () {
            
        },
        changePass: function() {
            var that = this;
            this.validate().then(function() {
                  Em.$.ajax({
                      type: 'PUT',
                      url: '/api/users/'+that.get('model.id'),
                      context: that,
                      data: {user:that.get('model').getProperties('password', 'passwordConfirmation')}
                  }).done(function(res) {
                      toastr.success('passwordChanged');
                      that.get('session').restore({access_token:res.access_token});
                      that.get('model').setProperties({password:'',passwordConfirmation:''});
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
