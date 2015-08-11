
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

function savePotential(_id, eng) {
	if(_id) {
		var params = {};
		if(eng) {
			params.eng = eng;
		}
		Meteor.call('import-possible', this._id, params);
	}
}

Template.englishCell.events({
	'click .save-potential': function(event, template) {
		var parentData = Template.parentData(3);
		savePotential(parentData._id, ''+this);
	}
});

Template.possibleGlyphsets.events({
	'click .save-possible-glyphset': function(event, template) {
		savePotential(this._id);
	}
});

Template.possibleGlyphsets.helpers({
	glyphsets: function() {
		return PossibleGlyphsets.find({}, { sort: { pop: 1 } });
	},
	glyphsetCount: function() {
		return PossibleGlyphsets.find().count();
	},
	pronunciationsSummary: function() {
		var proSummary = '';
		proSummary += (this.hira && this.hira.length && 'Hira:'+this.hira.length+"\n") || '';
		proSummary += (this.kata && this.kata.length && 'Kata:'+this.kata.length+"\n") || '';
		proSummary += (this.pinyin && this.pinyin.length && 'Piny:'+this.pinyin.length+"\n") || '';
		proSummary += (this.ko_h && this.ko_h.length && 'Ko_h:'+this.ko_h.length+"\n") || '';
		proSummary += (this.ko_r && this.ko_r.length && 'Ko_r:'+this.ko_r.length+"\n") || '';
		return proSummary ? proSummary.split("\n").filter(function(str){ return !!str }).join("\n") : false;
	},
	pronunciations: function() {
		var proCount = 0;
		proCount += (this.hira && this.hira.length) || 0;
		proCount += (this.kata && this.kata.length) || 0;
		proCount += (this.pinyin && this.pinyin.length) || 0;
		proCount += (this.ko_h && this.ko_h.length) || 0;
		proCount += (this.ko_r && this.ko_r.length) || 0;
		return proCount;
	},
	allEngs: function() {
		var set = Template.parentData();
		var engKeys = ['e', 'ej', 'ec', 'ek', 'ekat'];

		var engs = {};
		engKeys.forEach(function(lang) {
			if(set[lang]) {
				if(typeof set[lang] == 'string') {
					var eng = set[lang];
					engs[eng] = (engs[eng] || 0);
					engs[eng]++;
				}
				else if(set[lang] instanceof Array) {
					set[lang].forEach(function(eng) {
						engs[eng] = (engs[eng] || 0);
						engs[eng]++;
					});
				}
			}
		});

		var bestEngs = false;
		var keys = Object.keys(engs).sort(function(a, b) {
			return engs[a] > engs[b] ? -1 : 1;
		});

		return keys;
	},
	bestEngs: function() {
		var set = Template.parentData();
		var engKeys = ['e', 'ej', 'ec', 'ek', 'ekat'];

		var engs = {};
		engKeys.forEach(function(lang) {
			if(set[lang]) {
				if(typeof set[lang] == 'string') {
					var eng = set[lang];
					engs[eng] = (engs[eng] || 0);
					engs[eng]++;
				}
				else if(set[lang] instanceof Array) {
					set[lang].forEach(function(eng) {
						engs[eng] = (engs[eng] || 0);
						engs[eng]++;
					});
				}
			}
		});

		var bestEngs = false;
		var keys = Object.keys(engs).sort(function(a, b) {
			return engs[a] > engs[b] ? -1 : 1;
		});

		if(keys.length === 1) {
			bestEngs = [keys[0]];
		}
		else if(keys.length > 1) {
			if(engs[keys[0]] > engs[keys[1]]) {
				bestEngs = [keys[0]];
			}
			else if(keys.length > 2) {
				if(engs[keys[1]] > engs[keys[2]]) {
					bestEngs = [keys[0], keys[1]];
				}
			}
		}

		return bestEngs;
	}
});