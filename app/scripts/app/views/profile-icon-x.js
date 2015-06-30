import Ember from 'ember';

var ProfileIconView = Ember.View.extend({
  classNames:['profile-icon', 'img-circle', 'img-responsive'],
  tagName:'img',
  didInsertElement: function() {

    var icon = blockies.create({ // All options are optional
        seed: this.get('seed'), // seed used to generate icon data, default: random
        // color: '#FF676D', // to manually specify the icon color, default: random
        // bgcolor: '#294268', // choose a different background color, default: white
        size: 15, // width/height of the icon in blocks, default: 10
        scale: 3 // width/height of each block in pixels, default: 5
    }).toDataURL();

    this.$().attr('src',icon);
  }
});
Ember.Handlebars.helper('profile-icon', ProfileIconView);

export default ProfileIconView;
