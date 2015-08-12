
Template.registeredUsers.events({
	'click .make-user-admin': function(event, template) {
		Meteor.users.update(this._id, { $addToSet: { roles: 'admin' }});
	},
	'click .demote-user-admin': function(event, template) {
		Meteor.users.update(this._id, { $pull: { roles: 'admin' }});
	}
});

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

Template.availableGlyphsets.events({
	'click .revive-glyphset': function() {
		if(this._id) {
			Glyphsets.update({ _id: this._id }, { $set: { live: true }, $unset: { rank: "" }});
		}
	},
	'click .delete-glyphset': function() {
		if(this._id) {
			Glyphsets.update({ _id: this._id }, { $set: { live: false }});
			Meteor.call('recalc-ranks');
		}
	},
});

Template.availableGlyphsets.helpers({
	glyphsets: function() {
		return Glyphsets.find({}, { sort: { rank: 1 }});
	},
	glyphsetCount: function() {
		return Glyphsets.find().count();
	}
});

function savePotential(_id, eng) {
	if(_id) {
		var params = {};
		if(eng) {
			params.eng = eng;
		}
		Meteor.call('import-possible', _id, params);
	}
}

Template.englishCell.events({
	'click .save-potential': function(event, template) {
		if(this) {
			var parentData = Template.parentData(3) || Template.parentData(2) || Template.parentData();
			if(parentData && parentData._id) {
				savePotential(parentData._id, ''+this);
			}
		}
		$('#adding-glyph-modal:visible').modal('hide');
	}
});

Template.addingModal.events({
	'keypress': btnPrimaryOnEnter,
	'click .save-new-glyph': function(event, template) {
		var text = (template.find('.new-glyph-english').value);
		if(text) {
			savePotential(this._id, ''+text);
			template.$(template.find('.btn-default:last')).trigger('click');
		}
	},
	'shown.bs.modal': function(event, template) {
		template.$('input[type="text"]:first').focus().select();
	}
});

Template.possibleGlyphsets.events({
	'click .save-possible-glyphset': function(event, template) {
		Session.set('newGlyphId', this._id);
	}
});

Template.possibleGlyphsets.helpers({
	glyphsets: function() {
		return PossibleGlyphsets.find({}, { sort: { pop: 1 } });
	},
	glyphsetCount: function() {
		return PossibleGlyphsets.find().count();
	},
	//pronunciationsSummary: pronunciationsSummary,
	//pronunciations: pronunciations,
	allEngs: function() { return allEnglishFromPossibleGlyphset(this == 'e' ? Template.parentData() : this); },
	bestEngs: function() { return bestEnglishFromPossibleGlyphset(this == 'e' ? Template.parentData() : this); }
});

Template.addingModal.helpers({
	newGlyph: function() {
		var _id = Session.get('newGlyphId');
		if(_id) {
			return PossibleGlyphsets.findOne({ _id: _id });
		}
	},
	//pronunciationsSummary: pronunciationsSummary,
	//pronunciations: pronunciations,
	allEngs: function() { return allEnglishFromPossibleGlyphset(this == 'e' ? Template.parentData() : this); },
	bestEngs: function() { return bestEnglishFromPossibleGlyphset(this == 'e' ? Template.parentData() : this); }
});