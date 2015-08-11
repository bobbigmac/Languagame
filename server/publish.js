
Meteor.publish('user-scores', function(atGlyphSet, startNum, endNum) {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var users = Meteor.users.find({}, { fields: { 'emails.address': 1, 'profile.score': 1, 'profile.name': 1 }});
    return users;
  }
  this.ready();
  return;
});

Meteor.publish('all-glyphsets', function() {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var glyphsets = Glyphsets.find({}, {});
    return glyphsets;
  }
  this.ready();
  return;
});

Meteor.publish('possible-glyphsets', function() {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    //var glyphsets = PossibleGlyphsets.find({ pop: { $gt: 0 }, active: { $exists: false }, tc: { $exists: true }, sc: { $exists: true }, e: { $exists: true }, j: { $exists: true }}, { sort: { pop: 1, cpop: 1, jpop: 1 }, fields: { _id: 1 }});
    //var totalCount = glyphsets.fetch().length;

    var limitGlyphsets = PossibleGlyphsets.find({ live: true, pop: { $gt: 0 }, active: { $exists: false }, tc: { $exists: true }, sc: { $exists: true }, e: { $exists: true }, j: { $exists: true }}, { limit: 100, sort: { pop: 1, cpop: 1, jpop: 1 }});
    var limitCount = limitGlyphsets.fetch().length;

    console.log('Publishing', limitCount, 'possible inactive glyphsets');
    return limitGlyphsets;
  }
  this.ready();
  return;
});

Meteor.publish('glyphsetSet', function(atGlyphSet, startNum, endNum) {
  var minResults = 3;

  startNum = startNum >= 0 && startNum <= endNum - minResults ? startNum : 0;
  endNum = endNum >= 0 && endNum >= startNum + minResults ? endNum : minResults;
  
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

  var keyIds = [];
  for(var key in keys) {
    keyIds.push({ _id: 'g'+key });
  }

  var matchingGlyphsets = Glyphsets.find({ $or: keyIds });
  if(matchingGlyphsets && matchingGlyphsets.count()) {
    return matchingGlyphsets;
  }
  this.ready();
  return;
});
