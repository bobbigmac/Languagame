
rankCache = {};

resetGlyphsetRankCache = function(gsId) {
	rankCache = {};
}

getGlyphsetRank = function(gsId) {
	if(gsId) {
		if(!rankCache) {
			rankCache = {};
		}
		if(rankCache) {
			if(!rankCache[gsId]) {
				var glyphset = Glyphsets.findOne({ _id: gsId }, { fields: { _id: 1, rank: 1 }});
				if(glyphset) {
					rankCache[glyphset._id] = glyphset.rank;
				}
			}
			return rankCache[gsId];
		}
	}
}