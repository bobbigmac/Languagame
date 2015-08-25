
Meteor.publish('my-glyphsets', function() {
  if(this.userId) {
    var user = Meteor.users.findOne({ _id: this.userId }, { fields: { '_id': 1, 'profile.score': 1, 'strength': 1 }});
    var strength = (user && user.strength);
    if(strength) {
      var glyphsetCursor = Glyphsets.find({ _id: { $in: Object.keys(strength) }});
      return glyphsetCursor;
    }
  }
  this.ready();
  return;
});

Meteor.publish('my-strengths', function() {
  if(this.userId) {
    var userCursor = Meteor.users.find({ _id: this.userId }, { fields: { '_id': 1, 'profile.score': 1, 'strength': 1 }});
    return userCursor;
  }
  this.ready();
  return;
});

Meteor.publish('detailed-glyphs', function(glyphs, langs) {
  langs = (langs && langs instanceof Array && langs.length && langs)||defaultLangs;
  
  if(glyphs && glyphs instanceof Array && glyphs.length) {
    var glyphsets = Glyphsets.find({ _id: { $in: glyphs }});
    if(glyphsets && glyphsets.count()) {
      var glyphIds = [];
      glyphsets.fetch().forEach(function(gs) {
        langs.forEach(function(lang) {
          if(gs[lang]) {
            glyphIds.push((lang+'_'+gs[lang]+'').toLowerCase());
          }
        });
      });
      if(glyphIds && glyphIds.length) {
        return Glyphs.find({ _id: { $in: glyphIds }});
      }
    }
  }
  this.ready();
  return;
});
