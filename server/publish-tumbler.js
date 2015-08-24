

Meteor.publish('tumbler', function(score, minResults, langs) {
	var self = this;
	var collection = "glyphsetsets";
  langs = (langs && langs instanceof Array && langs.length ? langs : defaultLangs);
  
  minResults = (typeof minResults == 'number' && minResults) || 3;

	var _id = Random.id();
	var startNum = 1, endNum = startNum + minResults;
	
	var addRandomSets = function(mode, strength) {
		endNum = startNum + (((score||1) * 2) + 4);

	  startNum = (startNum > (endNum - minResults) ? (endNum - minResults) : startNum);
	  endNum = endNum > numberOfGlyphsets ? numberOfGlyphsets : endNum;

		var setsCursor = pullGlyphsets(langs, minResults, startNum, endNum, strength, self.userId);
		var sets = (setsCursor && setsCursor.fetch && setsCursor.fetch());

		sets.forEach(function(set) {
			langs.forEach(function(lang) {
				//TODO: This might give a performance improvement if queries are bundled
				var glyph = Glyphs.findOne({ _id: lang+'_'+set[lang] }, { fields: { _id: 1, a: 1 }});
				if(glyph && glyph.a) {
					if(!set.audio) {
						set.audio = {};
					}
					var audio = Audios.findOne({ _id: glyph.a });
					if(audio) {
						set.audio[lang] = audio.url();
					}
				}
			});
		});

		self[mode == 'added' ? 'added' : 'changed'](collection, _id, {
			sets: sets,
			score: score, startNum: startNum, endNum: endNum
		});
	};

	var observeHandle = false;
	//registered user
	if(this.userId) {
		observeHandle = Meteor.users.find({ 
			_id: this.userId
		}, {
			fields: { 'profile.score': 1, 'strength': 1 }
		}).observeChanges({
			added: function (id, fields) {
				score = ((fields && fields.profile && fields.profile.score) || score);
				strength = (fields && fields.strength);
				addRandomSets('added', strength);
			},
			changed: function (id, fields) {
				score = ((fields && fields.profile && fields.profile.score) || score);
				strength = (fields && fields.strength);
				addRandomSets('changed', strength);
			}
		});
	} else {
		addRandomSets('added');
	}

	//this.removed();
	this.onStop(function() {
		if(observeHandle && observeHandle.stop) {
			observeHandle.stop();
		}
	});

	//this.error();//report
	//this.stop();

	this.ready();
});