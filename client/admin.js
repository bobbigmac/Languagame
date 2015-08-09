
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

Template.availableGlyphsets.helpers({
	glyphsets: function() {
		return Glyphsets.find({}, {});
	},
	glyphsetCount: function() {
		return Glyphsets.find().count();
	}
});

Template.possibleGlyphsets.events({
	'click .save-possible-glyphset': function(event, template) {
		//TODO: Implement
		console.log('clicked', this);
	}
});

Template.possibleGlyphsets.helpers({
	glyphsets: function() {
		return PossibleGlyphsets.find({}, { sort: { pop: 1 } });
	},
	glyphsetCount: function() {
		return PossibleGlyphsets.find().count();
	}
});