
Meteor.publish('glyphSet', function(atGlyphSet, startNum, endNum) {
  var minResults = 3;

  startNum = startNum >= 0 && startNum <= endNum - minResults ? startNum : 0;
  endNum = endNum >= 0 && endNum >= startNum + minResults ? endNum : minResults;
  
  startNum = startNum > endNum - minResults ? endNum - minResults : startNum;
  endNum = endNum > numberOfGlyphs ? numberOfGlyphs : endNum;
  
  var keys = {};
  var setKeys = 0;

  while(setKeys < minResults) {
    var random = startNum + Math.floor(Math.random() * (endNum - startNum));
    if(!keys[random]) {
      keys[random] = true;
      setKeys++;
    }
  }

  //console.log(keys)
  var keyIds = [];
  for(var key in keys) {
    keyIds.push({ _id: 'g'+key });
  }

  var matchingGlyphs = glyphs.find({ $or: keyIds });
  return matchingGlyphs;
});
