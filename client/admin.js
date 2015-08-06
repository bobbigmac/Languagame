
Template.registeredUsers.helpers({
	userScores: function() {
		var filter = {};
		if(Meteor.userId()) {
			//filter['_id'] = { $ne: Meteor.userId() };
		}
		return Meteor.users.find(filter, { sort: { 'profile.score': -1 }});
	},
	userNumber: function() {
		var filter = {};
		if(Meteor.userId()) {
			//filter['_id'] = { $ne: Meteor.userId() };
		}
		return Meteor.users.find(filter).count();
	}
});

Template.availableGlyphs.helpers({
	glyphs: function() {
		return Glyphs.find({}, {});
	},
	glyphCount: function() {
		return Glyphs.find().count();
	}
});

Template.possibleGlyphs.events({
	'click .save-possible-glyph': function(event, template) {
		//TODO: Implement
		console.log('clicked', this);
	}
});

Template.possibleGlyphs.helpers({
	glyphs: function() {
		return PossibleGlyphs.find({}, { sort: { pop: 1 } });
	},
	glyphCount: function() {
		return PossibleGlyphs.find().count();
	}
});