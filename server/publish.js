
Meteor.publish('user-scores', function(atGlyphSet, startNum, endNum) {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var users = Meteor.users.find({}, { fields: { 'emails.address': 1, 'profile.score': 1, 'profile.name': 1 }});
    return users;
  }
  return this.ready();
});

Meteor.publish('all-glyphs', function() {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var glyphs = Glyphs.find({}, {});
    return glyphs;
  }
  return this.ready();
});

Meteor.publish('possible-glyphs', function() {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var glyphs = PossibleGlyphs.find({ pop: { $gt: 0 }, tc: { $exists: true }, sc: { $exists: true }, e: { $exists: true }, j: { $exists: true }}, { sort: { pop: 1, cpop: 1, jpop: 1 }, fields: { _id: 1 }});
    var totalCount = glyphs.fetch().length;

    var limitGlyphs = PossibleGlyphs.find({ pop: { $gt: 0 }, tc: { $exists: true }, sc: { $exists: true }, e: { $exists: true }, j: { $exists: true }}, { limit: 100, sort: { pop: 1, cpop: 1, jpop: 1 }});
    var limitCount = limitGlyphs.fetch().length;

    console.log('Publishing', limitCount, 'from total of', totalCount, 'possible glyphs');
    return limitGlyphs;
  }
  return this.ready();
});

Meteor.publish('glyphSet', function(atGlyphSet, startNum, endNum) {
  var minResults = 3;

  startNum = startNum >= 0 && startNum <= endNum - minResults ? startNum : 0;
  endNum = endNum >= 0 && endNum >= startNum + minResults ? endNum : minResults;
  
  startNum = startNum > endNum - minResults ? endNum - minResults : startNum;
  endNum = endNum > numberOfGlyphs ? numberOfGlyphs : endNum;
  
  var keys = {};
  var setKeys = 0;

  while(setKeys < minResults) {
    var random = startNum + Math.floor(Math.random() * (endNum - startNum));
    if(!keys[random]) {
      keys[random] = true;
      setKeys++;
    }
  }

  //console.log(keys)
  var keyIds = [];
  for(var key in keys) {
    keyIds.push({ _id: 'g'+key });
  }

  var matchingGlyphs = Glyphs.find({ $or: keyIds });
  return matchingGlyphs;
});
