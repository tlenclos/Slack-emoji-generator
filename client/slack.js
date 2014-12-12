Template.home.helpers({
});

Template.home.events({
  'click a#control-add-emoji': function() {
    generator.addEmojiSelector();
  },
  'click a#control-remove-emoji': function() {
    generator.removeSelectedEmoji();
  },
  'click a#control-generate': function() {
    generator.generate();
  }
});

Template.home.rendered = function() {
  var height = window.innerHeight-$('#controls').height()-100;
  var width = window.innerWidth-50;
  generator = new SlackGenerator(height, width, 'generator', 'imgLoader');
  generator.init();
};
