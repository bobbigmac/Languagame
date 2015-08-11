
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



var pronunciationsSummary = function() {
	var proSummary = '';
	proSummary += (this.hira && this.hira.length && 'Hira:'+this.hira.length+"\n") || '';
	proSummary += (this.kata && this.kata.length && 'Kata:'+this.kata.length+"\n") || '';
	proSummary += (this.pinyin && this.pinyin.length && 'Piny:'+this.pinyin.length+"\n") || '';
	proSummary += (this.ko_h && this.ko_h.length && 'Ko_h:'+this.ko_h.length+"\n") || '';
	proSummary += (this.ko_r && this.ko_r.length && 'Ko_r:'+this.ko_r.length+"\n") || '';
	return proSummary ? proSummary.split("\n").filter(function(str){ return !!str }).join("\n") : false;
};

var pronunciations = function() {
	var proCount = 0;
	proCount += (this.hira && this.hira.length) || 0;
	proCount += (this.kata && this.kata.length) || 0;
	proCount += (this.pinyin && this.pinyin.length) || 0;
	proCount += (this.ko_h && this.ko_h.length) || 0;
	proCount += (this.ko_r && this.ko_r.length) || 0;
	return proCount;
};

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
	pronunciationsSummary: pronunciationsSummary,
	pronunciations: pronunciations,
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
	pronunciationsSummary: pronunciationsSummary,
	pronunciations: pronunciations,
	allEngs: function() { return allEnglishFromPossibleGlyphset(this == 'e' ? Template.parentData() : this); },
	bestEngs: function() { return bestEnglishFromPossibleGlyphset(this == 'e' ? Template.parentData() : this); }
});