
rankCache = {};
var defaultLangs = ['e', 'j', 'tc', 'sc'];

function pullGlyphsets(langs, minResults, startNum, endNum, strength, userId) {
  langs = (langs && langs instanceof Array && langs.length ? langs : defaultLangs);
  minResults = (typeof minResults == 'number' && minResults) || 3;
  startNum = (typeof startNum == 'number' && startNum) || 1;
  endNum = (typeof endNum == 'number' && endNum) || 10;

  var ranks = [];
  if(strength) {
	  //Get all the ranks for strength keys, then upweight/downweight by language strength
	  var cacheRankIds = [], userAvgStrengths = {};
	  Object.keys(strength).forEach(function(gsId) {
	  	if(!rankCache) {
	  		rankCache = {};
	  	}
	  	if(!rankCache[gsId]) {
	  		cacheRankIds.push(gsId);
	  	}
	  	userAvgStrengths[gsId] = (langs.reduce(function(prev, lang) {
	  		return (prev||0)+(strength[gsId][lang]||0);
	  	}, 0) / langs.length);
	  });

	  if(cacheRankIds.length) {
	  	Glyphsets.find({ _id: { $in: cacheRankIds }}, { fields: { _id: 1, rank: 1 }}).fetch().forEach(function(gs) {
	  		rankCache[gs._id] = gs.rank;
	  	});
	  }

	  var userRanks = [];
	  var userStrengthIds = Object.keys(userAvgStrengths);
	  var totalStrength = 0;
	  var maxStrength = 0;
	  userStrengthIds.forEach(function(gsId) {
	  	var rank = rankCache[gsId];
	  	var score = userAvgStrengths[gsId];
	  	totalStrength += score;
	  	if(score > maxStrength) {
	  		maxStrength = score;
	  	}
	  	userRanks[rank] = (0-score);
	  });

	  var boost = 7;//Number of additional entries to consider available

	  var unknowns = 0;
	  for(var i=1; i<userStrengthIds.length+boost; i++) {
	  	if(!userRanks[i]) {
	  		unknowns++;
	  	} else {
	  		userRanks[i] = userRanks[i] + (maxStrength+1);
	  	}
	  }

	  var avgStrength = (totalStrength / userStrengthIds.length);
	  var newStrength = Math.round((totalStrength / (unknowns * 0.5)) * 100) / 100;
	  for(var i=1; i<userStrengthIds.length+boost; i++) {
	  	if(i > numberOfGlyphsets) {
	  		userRanks[i] = 0;
	  	} else {
		  	if(!userRanks[i]) {
		  		userRanks[i] = newStrength + 1;
		  	}
		  }
	  }

	  //Randomise by weighted, based on strength
	  var pairs = userRanks.map(function(chance, rank) { return rank && chance > 0 ? [rank, chance||0] : false; }).filter(function(val) { return !!val; });
	  ranks = (new WeightedList(pairs)).peek(minResults).map(function(rank){ return parseInt(rank); });
	  //console.log('ranks', ranks);
	} else {
	  var keys = {};
	  var setKeys = 0;

	  while(setKeys < minResults) {
	    var random = startNum + Math.floor(Math.random() * (endNum - startNum));
	    if(!keys[random]) {
	      keys[random] = true;
	      setKeys++;
	    }
	  }

	  ranks = Object.keys(keys).map(function(val) {
	    return parseInt(val);
	  });
	}

  var filter = { live: true, rank: { $in: ranks }};
  var options = { fields: { _id: 1 }, limit: minResults };
  langs.forEach(function (lang) {
    options.fields[lang] = 1;
  });

  var matchingGlyphsets = Glyphsets.find(filter, options);
  //console.log(startNum, endNum, 'in custom-publish', filter, matchingGlyphsets.count());
  if(matchingGlyphsets && matchingGlyphsets.count()) {
    return matchingGlyphsets;
  }
};

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

		self[mode == 'added' ? 'added' : 'changed'](collection, _id, {
			sets: (setsCursor && setsCursor.fetch && setsCursor.fetch()),
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