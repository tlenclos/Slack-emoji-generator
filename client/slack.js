
var height = window.innerHeight-150;
var width = window.innerWidth-300;
generator = new SlackGenerator(height, width, 'generator', 'imgLoader');

Template.home.helpers({
  'emojis': function() {
    return generator.emojis.get();
  }
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
  },
  'keyup input.emoji-name': function(event, context) {
    var name = event.target.value;
    var id = event.target.dataset.id;
    generator.setEmojiName(id, name);
  }
});

Template.home.rendered = function() {
  generator.init();
};
