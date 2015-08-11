

allEnglishFromPossibleGlyphset = function(set) {
	//var set = (this == 'e' ? Template.parentData() : this);
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
					if(eng.indexOf('surname') === -1) {
						engs[eng] = (engs[eng] || 0);
						engs[eng]++;
					}
				});
			}
		}
	});

	var bestEngs = false;
	var keys = Object.keys(engs).sort(function(a, b) {
		return engs[a] > engs[b] ? 1 : -1;
	});

	return keys;
};

bestEnglishFromPossibleGlyphset = function(set) {
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
};