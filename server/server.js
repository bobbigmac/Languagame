
numberOfGlyphs = 0;

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

  numberOfGlyphs = Glyphs.find({}).count();
  console.log('Have %d glyphs', numberOfGlyphs);

  Meteor.methods({
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
        console.log('Traditional... ', PossibleGlyphs.find({ tc: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Simplified... ', PossibleGlyphs.find({ sc: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Japanese... ', PossibleGlyphs.find({ j: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Korean... ', PossibleGlyphs.find({ k: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('English... ', PossibleGlyphs.find({ e: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Spanish... ', PossibleGlyphs.find({ es: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('French... ', PossibleGlyphs.find({ fr: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Portuguese... ', PossibleGlyphs.find({ pt: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('ALLLLL: ', PossibleGlyphs.find({
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