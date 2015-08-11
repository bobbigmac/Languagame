
numberOfGlyphsets = 0;

Meteor.startup(function () {

  var defaultAdmins = ['admin@bobbigmac.com'];
  defaultAdmins.forEach(function(defaultAdmin) {
    var user = Meteor.users.findOne({
      'emails.address': defaultAdmin
    });
    if(user && user._id) {
      if(!Roles.userIsInRole(user, 'admin')) {
        console.log('Assigning', defaultAdmin, 'to admin role');
        Roles.addUsersToRoles(user._id, 'admin');
      }
    }
  });

  numberOfGlyphsets = Glyphsets.find({}).count();
  console.log('Have %d glyphsets', numberOfGlyphsets);

  Meteor.methods({
    'reset-collections': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        if(typeof OldPossibleGlyphs !== 'undefined') {
          OldPossibleGlyphs.remove({});
        }
        if(typeof OldGlyphs !== 'undefined') {
          OldGlyphs.remove({});
        }
      }
    },
    'import-possible': function(_id, params) {
      if(typeof kanjiDic == 'undefined' || !kanjiDic) {
        console.log('Loading kanji dictionary globally...');
        kanjiDic = loadKanjiDictionary();
        console.log('Loaded kanji dictionary globally');
      }

      if(_id) {
        var poss = PossibleGlyphsets.findOne(_id);
        if(poss) {
          var eng = ((params && params.eng) || bestEnglishFromPossibleGlyphset(poss));
          var flatEngs = allEnglishFromPossibleGlyphset(poss);

          while(eng instanceof Array) {
            eng = eng[0];
          }

          if(poss.e) {
            poss.engs = poss.e;
          }
          poss.e = eng;

          var set = {};
          var dictKeys = ['type', 'pinyin', 'hira', 'kata', 'ko_h', 'ko_r', 'isRadical', 'hasRadical', 'sub'];
          var makeGlyphs = ['j', 'tc', 'sc', 'k', 'e'];
          var altLangKeys = ['fr', 'es', 'pt'];
          
          makeGlyphs.forEach(function(lang) {
            if(poss[lang]) {
              var glyph = {};
              glyph._id = (poss[lang]+'').toLowerCase();
              glyph.value = glyph._id;
              glyph['is_'+lang] = true;

              var dict = kanjiDic[poss[lang]];
              if(dict) {
                dictKeys.forEach(function(key) {
                  if(dict[key]) {
                    glyph[key] = dict[key];
                  }
                });
              }

              //chinese (simplified and traditional)
              if(lang === 'sc' || lang === 'tc') {
                if(poss.cpop) {
                  glyph.pop = poss.cpop;
                }
                if(poss.cpr) {
                  glyph.pro = poss.cpr;
                }
              }

              //japanese
              if(lang === 'j') {
                if(poss.jpop) {
                  glyph.pop = poss.jpop;
                }
                if(poss.jpr) {
                  glyph.pro = poss.jpr;
                }
              }

              //english
              if(lang === 'e') {
                if(flatEngs && flatEngs.length) {
                  glyph.values = [eng].concat(flatEngs);
                } else {
                  glyph.values = [eng];
                }
              }
              
              //console.log('glyph for lang', lang, poss[lang], 'gives', glyph);
              saveOrUpdateGlyph(glyph);

              //Add the set popularity
              set[lang] = poss[lang];
              if(poss.pop) {
                set.pop = poss.pop;
              } else if(poss.xpop) {
                set.pop = poss.xpop;
              } else if(poss.jpop && poss.cpop) {
                set.pop = Math.floor((parseFloat(poss.jpop) + parseFloat(poss.cpop)) / 2);
              } else if(poss.jpop || poss.cpop) {
                set.pop = (parseInt(poss.jpop||'0') || parseInt(poss.cpop||'0'));
              }
              if(typeof set.pop !== 'undefined' && !set.pop) {
                delete set.pop;
              }

              //Add additional (not as accurate) languages to the set
              if(dict) {
                altLangKeys.forEach(function(altLang) {
                  if(dict[altLang]) {
                    var altValues = dict[altLang];
                    if(altValues instanceof Array && altValues.length && altValues[0]) {
                      var altValue = (altValues[0]+'').toLowerCase();
                      var altGlyph = { _id: altValue, value: altValue, values: altValues };

                      altGlyph['is_'+altLang] = true;
                      
                      saveOrUpdateGlyph(altGlyph);

                      set[altLang] = altValue;
                      //console.log(altLang, 'altGlyph', altGlyph);
                    }
                  }
                });
              }
            }
          });

          //save set
          var res = saveOrUpdateGlyphset(set);
          if(res) {
            //Unflag poss as live
            if(poss._id) {
              PossibleGlyphsets.update({ _id: poss._id }, { $set: { live: false }});
            }
          }
        }
      }
    },
    'import-possibles': function(limit) {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        return importPossibles(limit);
      }
    },
    'test-kanji': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        var dict = loadKanjiDictionary();
        if(dict && dict instanceof Array) {
          return dict.length;
        }
        else if(dict && typeof dict === 'object') {
          return Object.keys(dict).length;
        }
      }
    },
    'potential-report': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        console.log('Traditional... ', PossibleGlyphsets.find({ tc: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Simplified... ', PossibleGlyphsets.find({ sc: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Japanese... ', PossibleGlyphsets.find({ j: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Korean... ', PossibleGlyphsets.find({ k: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('English... ', PossibleGlyphsets.find({ e: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Spanish... ', PossibleGlyphsets.find({ es: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('French... ', PossibleGlyphsets.find({ fr: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('Portuguese... ', PossibleGlyphsets.find({ pt: { $exists: true }}, { fields: { _id: 1}}).fetch().length);
        console.log('ALLLLL: ', PossibleGlyphsets.find({
          tc: { $exists: true },
          sc: { $exists: true },
          j: { $exists: true },
          k: { $exists: true },
          e: { $exists: true },
          es: { $exists: true },
          fr: { $exists: true },
          pt: { $exists: true }
        }, { fields: { _id: 1}}).fetch().length);
      }
    }
  });
});