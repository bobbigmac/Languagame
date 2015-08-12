
Meteor.startup(function() {
	recalcRanks = function() {

  	var arr = Glyphsets.find({
  		live: true
  	}, {
  		sort: { pop: 1 },
  		fields: { _id: 1, rank: 1 }
  	}).fetch();

  	if(arr.length) {
	  	numberOfGlyphsets = arr.length;

	  	//console.log('Checking rank on', arr.length, 'glyphsets');
	  	var reranked = 0;
	  	arr.forEach(function(glyphset, pos) {
	  		var rank = (pos + 1);

	  		if(glyphset.rank !== rank) {
	  			Glyphsets.update({ _id: glyphset._id }, { $set: { rank: rank }});
	  			reranked++;
	  		}
	  	});
	  	if(reranked) {
	  		//console.log('Reranked', reranked, 'glyphsets');
	  	}
	  }
	};

	Meteor.methods({
		'recalc-ranks': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
				recalcRanks();
			}
		}
	});

	Glyphsets.find({
		live: true,
		rank: { $exists: false }
	}, {
		limit: 1,
		fields: { _id: 1, live: 1, rank: 1 }
	}).observeChanges({
	  added: function(glyphset) {
	  	recalcRanks();
	  }
	});
});
