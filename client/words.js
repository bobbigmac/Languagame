
Session.setDefault('words-detail', []);

Template.words.events({
  'click .toggle-details': function() {
    var detailedWords = Session.get('words-detail');
    var wordPos = detailedWords.indexOf(this._id);
    //console.log(this._id, wordPos, this);
    if(wordPos > -1) {
      detailedWords.splice(wordPos, 1);
    } else {
      detailedWords.push(this._id);
    }
    Session.set('words-detail', detailedWords);
  }
});

Template.words.helpers({
  detailsVisible: function(_id) {
    _id = _id||this._id;
    var detailedWords = Session.get('words-detail');
    return (detailedWords.indexOf(_id) > -1);
  },
  glyphFor: function(lang, strength) {
    if(lang && strength && strength[lang]) {
      var gId = (lang+'_'+strength[lang].word).toLowerCase();
      var glyph = Glyphs.findOne({ _id: gId });
      return glyph;
    }
  }
});