module.exports = Em.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
  model: function() {
      return Em.Object.create({name:'', from:0, to:0});
  }
});
