
numberOfGlyphsets = 0;

Meteor.startup(function () {

  var defaultAdmins = ['admin@bobbigmac.com'];
  defaultAdmins.forEach(function(defaultAdmin) {
    var user = Meteor.users.findOne({
      'emails.address': defaultAdmin
    });
    if(user && user._id) {
      if(!Roles.userIsInRole(user, 'admin')) {
        console.log('Assigning', defaultAdmin, 'to admin role');
        Roles.addUsersToRoles(user._id, 'admin');
      }
    }
  });

  numberOfGlyphsets = Glyphsets.find({}).count();
  console.log('Have %d glyphsets', numberOfGlyphsets);

  Meteor.methods({
    'reset-collections': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        if(typeof OldPossibleGlyphs !== 'undefined') {
          OldPossibleGlyphs.remove({});
        }
        if(typeof OldGlyphs !== 'undefined') {
          OldGlyphs.remove({});
        }
      }
    },
    'import-possible': function(_id, params) {
      //TODO: Implement
      console.log('want to import', _id, params);
    },
    'import-possibles': function(limit) {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        return importPossibles(limit);
      }
    },
    'test-kanji': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        var dict = loadKanjiDictionary();
        if(dict && dict instanceof Array) {
          return dict.length;
        }
        else if(dict && typeof dict === 'object') {
          return Object.keys(dict).length;
        }
      }
    },
    'potential-report': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        console.log('Traditional... ', PossibleGlyphsets.find({ tc: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Simplified... ', PossibleGlyphsets.find({ sc: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Japanese... ', PossibleGlyphsets.find({ j: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Korean... ', PossibleGlyphsets.find({ k: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('English... ', PossibleGlyphsets.find({ e: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Spanish... ', PossibleGlyphsets.find({ es: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('French... ', PossibleGlyphsets.find({ fr: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Portuguese... ', PossibleGlyphsets.find({ pt: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('ALLLLL: ', PossibleGlyphsets.find({
          tc: { $exists: true },
          sc: { $exists: true },
          j: { $exists: true },
          k: { $exists: true },
          e: { $exists: true },
          es: { $exists: true },
          fr: { $exists: true },
          pt: { $exists: true }
        }, { fields: { _id: 1}}).fetch().length);
      }
    }
  });
});