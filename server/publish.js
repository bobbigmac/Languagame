
Meteor.publish('user-scores', function(atGlyphSet, startNum, endNum) {
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
    var glyphsets = Glyphsets.find({}, { sort: { created: 1, pop: 1 }});
    return glyphsets;
  }
  this.ready();
  return;
});

Meteor.publish('all-glyphs', function() {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var glyphs = Glyphs.find({}, { sort: { created: 1, pop: 1 }});
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

Meteor.publish('glyphsetSet', function(atGlyphSet, startNum, endNum, langs) {
  var minResults = 3;
  var langs = (langs && langs instanceof Array && langs.length ? langs : ['e', 'j', 'tc', 'sc']);

  startNum = startNum >= 0 && startNum <= endNum - minResults ? startNum : 0;
  startNum += 1;
  endNum = endNum >= 0 && endNum >= startNum + minResults ? endNum : (minResults+1);
  
  startNum = startNum > endNum - minResults ? endNum - minResults : startNum;
  endNum = endNum > numberOfGlyphsets ? numberOfGlyphsets : endNum;

  var keys = {};
  var setKeys = 0;

  while(setKeys < minResults) {
    var random = startNum + Math.floor(Math.random() * (endNum - startNum));
    if(!keys[random]) {
      keys[random] = true;
      setKeys++;
    }
  }

  var ranks = Object.keys(keys).map(function(val) {
    return parseInt(val);
  });

  var filter = { live: true, rank: { $in: ranks }};
  var options = { fields: { _id: 1 }, limit: minResults };
  langs.forEach(function (lang) {
    options.fields[lang] = 1;
  });

  var matchingGlyphsets = Glyphsets.find(filter, options);
  //console.log(filter, matchingGlyphsets.count())
  if(matchingGlyphsets && matchingGlyphsets.count()) {
    return matchingGlyphsets;
  }

  this.ready();
  return;
});
