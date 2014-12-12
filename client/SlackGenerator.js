/*
    TODO
    - Preview below name in list
    - Automatic uploader to slack
    - Local storage
    - Better design
    - Preview of all emojis (split layout ?)
 */
(function(globals){
    'use strict';

    globals.SlackGenerator = function (_height, _width, _canvasId, _imageLoaderId) {
        this.canvasId = _canvasId;
        this.imageLoadDomId = _imageLoaderId;
        this.canvas = this.imageLoader = null;
        this.emojis = new ReactiveVar([]);
        this.emojiSize = 128;
        this.emojiVisible = true;
        var self = this;

        // Set up the canvas element
        this.init = function () {
            self.canvas = new fabric.Canvas(self.canvasId);

            self.canvas.setHeight(_height);
            self.canvas.setWidth(_width);
            self.canvas.renderAll();

            self.addEmojiSelector();
            self.addTestImage();
            self.setupEvents();
        };

        this.setupEvents = function() {
            document.getElementById(self.imageLoadDomId).onchange = function handleImage(e) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var imgObj = new Image();
                    imgObj.src = event.target.result;
                    imgObj.onload = function () {
                        var image = new fabric.Image(imgObj);
                        image.set({
                            left: 50,
                            top: 50,
                            padding: 10,
                            cornersize: 10
                        });
                        self.canvas.add(image);
                        self.canvas.moveTo(image, 0);
                    }
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };

        this.addEmojiSelector = function() {
            // Rect
            var rect = new fabric.Rect({
                width : self.emojiSize,
                height : self.emojiSize,
                strokeWidth: 5,
                stroke: 'black',
                opacity: 0.4,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true
            });

            // Emoji name
            var text = new fabric.Text(':emoji', {
                textAlign: 'center',
                fontSize: 30,
                left: rect.left+30,
                top: rect.top+40
            });

            // Group
            var group = new fabric.Group([rect, text], {
                top : 100,
                left : 100
            });

            self.canvas.add(group);
            self.canvas.moveTo(group, 10);

            self.addEmoji(':emoji', group);
        };

        this.addTestImage = function() {
            var imageUrl = 'test_image.png';
            fabric.Image.fromURL(imageUrl, function(oImg) {
                oImg.set({
                    left: 50,
                    top: 50,
                    padding: 10,
                    cornersize: 10
                });
                self.canvas.add(oImg);
                self.canvas.moveTo(oImg, 0);
            });
        };

        this.toggleLayerVisibility = function() {
            self.emojis.get().forEach(function(object) {
                object.opacity = !self.emojiVisible;
            });

            self.emojiVisible = !self.emojiVisible;
            self.canvas.renderAll();
            self.canvas.deactivateAll();
        };

        this.removeSelectedEmoji = function() {
            var emoji = self.canvas.getActiveObject();
            if (emoji) {
                self.canvas.remove(emoji);
                self.removeEmoji(emoji);
            }
        };

        this.addEmoji = function(name, object) {
            var emojis = self.emojis.get();
            emojis.push({index: emojis.length, name: name, view: object});
            self.emojis.set(emojis);
        };

        this.removeEmoji = function(emojiView) {
            var emoji = _.find(self.emojis.get(), function(item) { return item.view == emojiView});

            if (emoji) {
                var emojis = self.emojis.get();
                emojis.splice(self.emojis.get().indexOf(emoji), 1);
                self.emojis.set(emojis);
            } else {
                console.error('Error while deleting emoji', emojiView);
            }
        };

        this.setEmojiName = function(id, name) {
            var emoji = _.find(self.emojis.get(), function(item) { return item.index == id});

            if (emoji) {
                var emojis = self.emojis.get();
                var index = emojis.indexOf(emoji);
                emoji.name = name;
                emoji.view.item(1).text = name;
                emojis[index] = emoji;
                self.emojis.set(emojis);

                self.canvas.renderAll();
            } else {
                console.error('Error while setting emoji name', id, name);
            }
        };

        this.generate = function() {
            var exportData = [];

            self.toggleLayerVisibility();
            self.emojis.get().forEach(function(object) {
                var view = object.view;
                var left = view.left;
                var top = view.top-view.item(0).top-18; // WTF ?

                exportData.push({
                    name: view.item(1).text,
                    data: self.canvas.toDataURL({
                        format: 'png',
                        left: left,
                        top: top,
                        width: self.emojiSize,
                        height: self.emojiSize
                    })
                });
            });

            var blob = new Blob([JSON.stringify(exportData, null, 4)], { "type" : "application\/json" });
            saveAs(blob, "export.json");
            fabric.log('Export generated ', exportData);

            self.toggleLayerVisibility();
        };
    };
}(this));
