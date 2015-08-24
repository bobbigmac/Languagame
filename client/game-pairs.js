
Template.pairGlyph.events({
	'click .pair-glyph': function(event, template) {
		var lastGlyph = Session.get('lastGlyph');
		var lastGlyphset = Session.get('lastGlyphset');
		if(!this || (this+'' === 'false')) {
			return false;
		}
		playAudioForSpan(template.$(template.find('button')));

		Session.set('failedGlyph', false);
		Session.set('matchingGlyph', false);

		var parentData = Template.parentData(1);
		var sets = (parentData && parentData.sets);

		if(lastGlyph && this._id !== lastGlyph) {
			if(lastGlyph !== this._id && lastGlyphset == this.gsId) {
				var gsId = this.gsId;
				Session.set('matchingGlyph', lastGlyph)

				if(sets) {
					var scoreLangs = {};
					scoreLangs[gsId] = {};
					sets.forEach(function(set) { if(set && set.gsId === gsId) { scoreLangs[gsId][set.lang] = 1; }});
					var setCount = sets.reduce(function(prev, set, pos){
						if(set.gsId === lastGlyphset) {
							sets[pos] = false;
						}
						return prev+(sets[pos]? 1 : 0);
					}, 0);

					if(Meteor.userId()) {
						changePlayerScore(1, scoreLangs, gsId);
					} else {
						if(!setCount) {
							changePlayerScore(1);
							Session.set('unreactiveSets', false);
							Session.set('lastGlyph', false);
							Session.set('lastGlyphset', false);
						} else {
							Session.set('unreactiveSets', sets);
						}
					}

					if(!setCount) {
      			celebrateWin();
					}

					Session.set('lastGlyph', false);
					//Session.set('lastGlyphset', false);
				}
			} else {
				Session.set('failedGlyph', lastGlyph);

				// Downrank the strength for these two glyphs (against gsId, for given langs)
				if(sets) {
					var gsId = this.gsId;
					var failedGsId = lastGlyphset;

					if(gsId && failedGsId) {
						var scoreLangs = {}, scoreChanges = 0;
						sets.forEach(function(set) {
							if(set && set.gsId === gsId) {
								if(!scoreLangs[gsId]) {
									scoreLangs[gsId] = {};
								}
								scoreLangs[gsId][set.lang] = -1;
								scoreChanges++;
							}
							if(set && set.gsId === failedGsId) {
								if(!scoreLangs[failedGsId]) {
									scoreLangs[failedGsId] = {};
								}
								scoreLangs[failedGsId][set.lang] = -1;
								scoreChanges++;
							}
						});
						if(scoreChanges) {
							if(Meteor.userId()) {
								changePlayerScore(0, scoreLangs);
							}
						}
					}
				}

				Session.set('lastGlyph', this._id);
				Session.set('lastGlyphset', this.gsId);
			}
		} else {
			Session.set('lastGlyph', this._id);
			Session.set('lastGlyphset', this.gsId);
		}
	}
});

Template.pairGlyph.helpers({
	failed: function() {
		var failedGlyph = Session.get('failedGlyph');
		if(failedGlyph) {
			return Session.equals('lastGlyph', this._id) || Session.equals('failedGlyph', this._id);
		}
	},
	matched: function() {
		var matchingGlyph = Session.get('matchingGlyph');
		if(matchingGlyph) {
			return Session.equals('lastGlyphset', this.gsId);
			//return Session.equals('lastGlyph', this._id) || Session.equals('matchingGlyph', this._id);
		}
	},
	selected: function() {
		var lastGlyph = Session.get('lastGlyph');
		return (lastGlyph && lastGlyph === this._id);
		//return !Session.equals('failedGlyph', this._id) && Session.equals('lastGlyph', this._id);
	}
});

Template.pairs.rendered = function() {
	Session.set('failedGlyph', false);
	Session.set('matchingGlyph', false);
	Session.set('lastGlyph', false);
	Session.set('lastGlyphset', false);
	Session.set('unreactiveSets', false);
};

Template.pairs.helpers({
	glyphpairs: function() {
		var unreactive = Session.get('unreactiveSets');
		if(!Meteor.userId() && unreactive && unreactive.length) {
			return unreactive;
		}
		if(this && this.sets && this.sets.length === 24) {
			return this.sets;
		}
	}
});