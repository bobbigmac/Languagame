

Meteor.publish('pairs', function(score, minResults, langs /*, lastGlyphset*/) {
	var self = this;
	var collection = "glyphsetsets";
  langs = (langs && langs instanceof Array && langs.length ? langs : defaultLangs);
  
  minResults = (typeof minResults == 'number' && minResults) || 12;

  var grid = [];

	var _id = Random.id();
	var startNum = 1, endNum = startNum + minResults;

	var liveCandidates = [];//new Array(minResults*2);
	for(var i=0; i<(minResults*2); i++) {
		liveCandidates[i] = false;
	}
	var forceFill = false;
	
	var addRandomSets = function(mode, strength, lastPair) {
		var liveCandidatesCount = liveCandidates.reduce(function(prev, curr, pos) {
			if(lastPair && (curr && curr.gsId == lastPair)) {
				liveCandidates[pos] = false;
			}
			return prev + (liveCandidates[pos] ? 1 : 0);
		}, 0) / 2;

		//Need all candidate's langs to have a value
		do {
			var numResults = (minResults - liveCandidatesCount);
			
			if(numResults === minResults) {
				forceFill = true;
			}
			//TODO: set this to a lower number to refresh the available pairs sooner
			if(!forceFill && numResults < minResults) {
				break;
			}

			endNum = startNum + (((score||1) * 4) + 8);
		  startNum = (startNum > (endNum - numResults) ? (endNum - numResults) : startNum);
		  endNum = endNum > numberOfGlyphsets ? numberOfGlyphsets : endNum;

			var setsCursor = pullGlyphsets(langs, numResults, startNum, endNum, strength, self.userId, minResults);
			var sets = (setsCursor && setsCursor.fetch && setsCursor.fetch());

			var candidates = [];

			sets.forEach(function(set) {
				langs = _.shuffle(langs);

				langs.forEach(function(lang) {
					if(set[lang] && set._id !== lastPair) {
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

						var occurs = candidates.reduce(function(prev, curr) {
							return prev + (curr && curr.gsId === set._id ? 1 : 0);
						}, 0);
						var liveOccurs = liveCandidates.reduce(function(prev, curr) {
							return prev + (curr && curr.gsId === set._id ? 1 : 0);
						}, 0);

						if(occurs < 2 && !liveOccurs) {
							var candidate = {};
							candidate.lang = lang;
							candidate._id = lang+'_'+set._id;
							candidate.gsId = set._id;
							candidate.value = set[lang];
							if(set.audio && set.audio[lang]) {
								candidate.audio = set.audio[lang];
							}

							candidates.push(candidate);
						}
					}
				});
			});

			if(candidates.length) {
				candidates = _.shuffle(candidates);
			}
			for(var i=0; i<liveCandidates.length; i++) {
				if(!liveCandidates[i]) {
					liveCandidates[i] = candidates.pop();
				}
			};

			var liveCandidatesCount = liveCandidates.reduce(function(prev, curr, pos) {
				return prev + (liveCandidates[pos] ? 1 : 0);
			}, 0) / 2;

			//console.log('candidates', candidates.length, 'glyphs for', minResults, 'pairs going onto liveCandidates', liveCandidatesCount);
			
		} while(liveCandidatesCount < minResults);

		forceFill = false;

		//TODO: Issue only the difference as the change (not the whole new set)
		self[mode == 'added' ? 'added' : 'changed'](collection, _id, {
			sets: liveCandidates,
			score: score, startNum: startNum, endNum: endNum, numResults: numResults
		});
		if(mode == 'added') {
			self.ready();
		}
	};

	var observeHandle = false;
	//registered user
	if(this.userId) {
		observeHandle = Meteor.users.find({ 
			_id: this.userId
		}, {
			fields: { 'profile.score': 1, 'strength': 1, 'profile.lastPair': 1 }
		}).observeChanges({
			added: function (id, fields) {
				score = ((fields && fields.profile && fields.profile.score) || score);
				var lastPair = (fields && fields.profile && fields.profile.lastPair);
				strength = (fields && fields.strength);
				addRandomSets('added', strength, lastPair);
			},
			changed: function (id, fields) {
				score = ((fields && fields.profile && fields.profile.score) || score);
				var lastPair = (fields && fields.profile && fields.profile.lastPair);
				strength = (fields && fields.strength);
				addRandomSets('changed', strength, lastPair);
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

	//this.ready();
});