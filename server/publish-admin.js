
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
    Counts.publish(this, 'count-unaudio-glyphs', Glyphs.find({ a: { $exists: false }}));
    Counts.publish(this, 'count-possible-glyphsets', PossibleGlyphsets.find());
  }
  this.ready();
  return;
});

Meteor.publish('all-glyphsets', function(langs) {
  langs = (langs && langs instanceof Array && langs.length && langs)||defaultLangs;

  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var sort = {};
    sort.rank = 1;

    var filter = { live: true };
    langs.forEach(function (lang) {
      subFilter = {};
      subFilter[lang] = { $exists: false };
      if(!filter['$or']) {
        filter['$or'] = [];
      }
      filter['$or'].push(subFilter);
    });

    var glyphsets = Glyphsets.find(filter, { sort: sort });
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

Meteor.publish('unaudio-glyphs', function(langs) {
  langs = (langs && langs instanceof Array && langs.length && langs)||defaultLangs;

  if(Roles.userIsInRole(this.userId, ['admin'])) {
    var or = [];
    langs.forEach(function(lang) {
      var test = {};
      test['is_'+lang] = true;
      or.push(test);
    });
    var filter = { a: { $exists: false }, $or: or };
    var glyphs = Glyphs.find(filter, { sort: { pop: 1 }, limit: 100 });
    return glyphs;
  }
  this.ready();
  return;
});

Meteor.publish('possible-glyphsets', function(filter, sort) {
  if(Roles.userIsInRole(this.userId, ['admin'])) {
    if(false && (typeof kanjiDic == 'undefined' || !kanjiDic)) {
      console.log('Loading kanji dictionary globally...');
      kanjiDic = loadKanjiDictionary();
      console.log('Loaded kanji dictionary globally');
    }
    filter = (typeof filter == 'object' && filter) || {
      pop: { $gt: 0 }, 
      tc: { $exists: true },
      sc: { $exists: true },
      e: { $exists: true },
      j: { $exists: true },
      //k: { $exists: true }
    };

    filter['$or'] = [
      { hide: { $ne: true }},
      { hide: { $exists: false }},
    ];
    filter.live = true;
    filter.active = { $exists: false };

    sort = sort || { pop: 1, cpop: 1, jpop: 1 };
    var limitGlyphsets = PossibleGlyphsets.find(filter, { limit: 100, sort: sort });

    var limitCount = limitGlyphsets.fetch().length;

    console.log('Publishing', limitCount, 'possible inactive glyphsets');
    return limitGlyphsets;
  }
  this.ready();
  return;
});