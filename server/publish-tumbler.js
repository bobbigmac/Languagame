
function pullGlyphsets(langs, minResults, startNum, endNum) {
  minResults = (typeof minResults == 'number' && minResults) || 3;
  startNum = (typeof startNum == 'number' && startNum) || 1;
  endNum = (typeof endNum == 'number' && endNum) || 10;

  var keys = {};
  var setKeys = 0;

  while(setKeys < minResults) {
    var random = startNum + Math.floor(Math.random() * (endNum - startNum));
    if(!keys[random]) {
      keys[random] = true;
      setKeys++;
    }
  }

  var ranks = Object.keys(keys).map(function(val) {
    return parseInt(val);
  });

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

Meteor.publish('tumbler', function(score, minResults) {
	var self = this;
	var collection = "glyphsetsets";
  var langs = (langs && langs instanceof Array && langs.length ? langs : ['e', 'j', 'tc', 'sc']);
  minResults = (typeof minResults == 'number' && minResults) || 3;

	var _id = Random.id();
	var startNum = 1, endNum = startNum + minResults;
	
	var addRandomSets = function(mode) {
		endNum = startNum + (((score||1) * 2) + 4);

	  startNum = (startNum > (endNum - minResults) ? (endNum - minResults) : startNum);
	  endNum = endNum > numberOfGlyphsets ? numberOfGlyphsets : endNum;

		var setsCursor = pullGlyphsets(langs, minResults, startNum, endNum);

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
				addRandomSets('added');
			},
			changed: function (id, fields) {
				score = ((fields && fields.profile && fields.profile.score) || score);
				addRandomSets('changed');
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