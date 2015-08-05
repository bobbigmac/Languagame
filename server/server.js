
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

  //Set pop (popularity field for all glyphs, by numeric index parse)
  /*var noPopFilter = { pop: { $exists: false }}
  if(Glyphs.findOne(noPopFilter)) {
    Glyphs.find(noPopFilter, { fields: { _id: 1, e: 1, pop: 1 }}).fetch().forEach(function(gl) {
      var pop = (gl._id+'').replace(/^[^\d]*(\d+)/igm, '$1');
      if(pop || pop === 0) {
        Glyphs.update(gl._id, {
          $set: {
            pop: parseInt(pop)
          }
        }, function(err, updated) {
          if(!err && updated === 1) {
            console.log('Updated', gl.e, 'with pop', pop);
          } else {
            console.log(err);
          }
        });
      }
    });
  }*/

  numberOfGlyphs = Glyphs.find({}).count();
  console.log('Have %d glyphs', numberOfGlyphs);

  Meteor.methods({
    'import-possibles': function(limit) {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        return importPossibles(limit);
      }
    }
  });
});