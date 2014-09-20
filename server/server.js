
var glyphs = new Meteor.Collection('glyphs');

var numberOfGlyphs = 0;
Meteor.startup(function () {

  if(!glyphs.findOne({})) {
    var testChars = Meteor.testChars;

    for(var i=0; i<testChars.length; i++)
    {
      testChars[i]._id = 'g'+i;
      glyphs.insert(testChars[i]);
    }
  }
  else {
    numberOfGlyphs = glyphs.find({}).count();
    console.log('Have %d glyphs', numberOfGlyphs);
  }
});

Meteor.publish('glyphSet', function(atGlyphSet) {
  var keys = {};
  var setKeys = 0;

  while(setKeys < 3) {
    var random = Math.floor(Math.random() * numberOfGlyphs);
    if(!keys[random]) {
      keys[random] = true;
      setKeys++;
    }
  }

  var keyIds = [];
  for(var key in keys) {
    keyIds.push({ _id: 'g'+key });
  }

  var matchingGlyphs = glyphs.find({ $or: keyIds });
  return matchingGlyphs;
});
