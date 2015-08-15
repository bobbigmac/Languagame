
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

Meteor.publish('user-scores', function() {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var users = Meteor.users.find({}, { fields: { 'emails.address': 1, 'profile.score': 1, 'profile.name': 1, 'roles': 1 }});
    return users;
  }
  this.ready();
  return;
});

Meteor.publish('admin-stats', function() {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    Counts.publish(this, 'count-glyphsets', Glyphsets.find({ live: true }));
    Counts.publish(this, 'count-glyphs', Glyphs.find({ }));
    Counts.publish(this, 'count-possible-glyphsets', PossibleGlyphsets.find());
  }
  this.ready();
  return;
});

Meteor.publish('all-glyphsets', function() {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var glyphsets = Glyphsets.find({}, { sort: { pop: 1 }});
    return glyphsets;
  }
  this.ready();
  return;
});

Meteor.publish('all-glyphs', function() {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var glyphs = Glyphs.find({}, { sort: { pop: 1 }});
    return glyphs;
  }
  this.ready();
  return;
});

Meteor.publish('possible-glyphsets', function() {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    if(false && (typeof kanjiDic == 'undefined' || !kanjiDic)) {
      console.log('Loading kanji dictionary globally...');
      kanjiDic = loadKanjiDictionary();
      console.log('Loaded kanji dictionary globally');
    }

    var limitGlyphsets = PossibleGlyphsets.find({
      live: true, 
      pop: { $gt: 0 }, 
      active: { $exists: false },
      tc: { $exists: true },
      sc: { $exists: true },
      e: { $exists: true },
      j: { $exists: true },
      $or: [
        { hide: { $ne: true }},
        { hide: { $exists: false }},
      ]
    }, { limit: 100, sort: { pop: 1, cpop: 1, jpop: 1 }});

    var limitCount = limitGlyphsets.fetch().length;

    console.log('Publishing', limitCount, 'possible inactive glyphsets');
    return limitGlyphsets;
  }
  this.ready();
  return;
});