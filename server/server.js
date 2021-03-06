
numberOfGlyphsets = 0;

Meteor.startup(function () {

  //index
  Glyphsets._ensureIndex({ rank: 1, live: 1 });
  Glyphs._ensureIndex({ a: 1 });
  numberOfGlyphsets = Glyphsets.find({ live: true }).count();

  //methods
  Meteor.methods({
    'set-glyphset-lang': function(gsId, lang, val) {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        lang = (lang && typeof lang === 'string' && lang.trim());
        val = (val && typeof val === 'string' && val.trim());

        if(gsId && lang && val) {
          var set = {};
          set[lang] = val;
          //console.log('gs', gs, lang, val);//criança
          
          var glyph = {
            _id: lang+'_'+val,
            value: val,
            //values: [val]
          };
          glyph['is_'+lang] = true;

          //console.log('setting ', set, 'for', gsId);
          Glyphsets.update({ _id: gsId }, {
            $set: set
          }, function(err, affected) {
            if(!err) {
              //console.log('Setting glyph', glyph);
              saveOrUpdateGlyph(glyph);
            } else {
              console.log(err);
            }
          });
        }
      }
    },
    'fix-glyph-values': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        var glyphs = Glyphs.find({ $where: "this._id == this.value" });
        if(glyphs.count()) {
          console.log('Broken glyphs: ', glyphs.count());
          var fixed = 0;
          glyphs.fetch().forEach(function(g) {
            if(g.value.indexOf('_') > -1) {
              var val = g.value.split('_')[1];
              if(Glyphs.update({ _id: g._id }, { $set: { value: val }})) {
                fixed++;
              }
            }
          });
          console.log('Fixed glyphs', fixed);
        }
      }
    },
    'reset-ranks': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        Glyphsets.update({}, { $unset: { rank: "" }}, { multi: true });
        resetGlyphsetRankCache();
      }
    },
    'reset-collections': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        
        Glyphsets.remove({});
        Glyphs.remove({});

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
              glyph._id = (lang+'_'+poss[lang]+'').toLowerCase();
              glyph.value = poss[lang];
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
                set.pop = parseInt(poss.pop);
              } else if(poss.xpop) {
                set.pop = parseInt(poss.xpop);
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
                      var altGlyph = { _id: altLang+'_'+altValue, value: altValue, values: altValues };

                      altGlyph['is_'+altLang] = true;
                      
                      saveOrUpdateGlyph(altGlyph);

                      set[altLang] = altValue;
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
              var update = { live: false };


              var keyLangs = ['j', 'tc', 'sc'];
              var filter = {};
              keyLangs.forEach(function(lang) {
                if(poss[lang]) {
                  filter[lang] = poss[lang];
                }
              });

              var active = Glyphsets.findOne(filter, { fields: { _id: 1 }});
              if(active) {
                update.active = active._id;
              }

              PossibleGlyphsets.update({ _id: poss._id }, { $set: update });
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
    'review-hangul': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        var dict = loadKanjiDictionary();
        if(dict && dict instanceof Array) {
          return dict.length;
        }
        else if(dict && typeof dict === 'object') {
          var keys = Object.keys(dict);
          if(keys.length) {
            var coss = {};
            keys.forEach(function(key) {
              if(dict[key].ko_h && dict[key].ko_h.length > 2) {
                var hang = dict[key].ko_h.join(' / ');
                coss[hang] = coss[hang]||0;
                coss[hang]++;
              }
            });
            var mults = Object.keys(coss).map(function(key) { var val=coss[key]; if(val > 1) { return { key: key, occ: coss[key] }; }}).filter(function(val){ return !!val; });
            console.log(mults);
          }
          return mults;
        }
      }
    },
    'fix-hangul': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        console.log('fixing hangul glyphs');

        var glyphsCursor = Glyphs.find({ is_k: true, oldId: { $exists: false }});
        glyphsCursor.fetch().forEach(function(g) {

          var oldValue = g.value;
          var oldId = g._id;

          if(g.ko_h) {
            var newValue = g.ko_h.join(' / ');
            var newId = 'k_'+newValue;
            console.log('Want to set', oldId, 'to', newId);
            
            var newGlyph = g;
            newGlyph._id = newId;
            newGlyph.value = newValue;
            newGlyph.values = g.ko_h;
            newGlyph.oldId = oldId;
            newGlyph.oldValue = oldValue;

            var okay = false;
            if(!Glyphs.findOne({ _id: newGlyph._id })) {
              if(Glyphs.insert(newGlyph)) {
                okay = true;
              }
            } else {
              okay = true;
            }
          } else {
            okay = true;
          }

          if(okay) {
            if(Glyphs.remove({ _id: oldId })) {
              console.log('Removed', oldId);
              if(newValue) {
                if(Glyphsets.update({ k: oldValue }, { $set: { k: newValue }})) {
                  console.log('Updated', oldId, 'to', newId);
                }
              }
            }
          }
        });

        PossibleGlyphsets.find({ k: { $exists: true }}).fetch().forEach(function(pg) {
          
          var newValue = (pg && pg.k && pg.meta_k && pg.meta_k.ko_h && pg.meta_k.ko_h.join && pg.meta_k.ko_h.join(' / '));
          if(newValue) {
            if(PossibleGlyphsets.update({ _id: pg._id }, { $set: {
              k: newValue
            }})) {
              console.log('Updated possible for', pg.k, 'to', newValue);
            }
          } else {
            if(PossibleGlyphsets.update({ _id: pg._id }, { $unset: { k: "" }})) {
              console.log('Unset k for', pg.k);
            }
          }
        });
      }
    },
    'test-kanji': function() {
      if(Roles.userIsInRole(this.userId, ['admin'])) {
        var dict = loadKanjiDictionary();
        if(dict && dict instanceof Array) {
          return dict.length;
        }
        else if(dict && typeof dict === 'object') {
          var keys = Object.keys(dict);
          // if(keys.length) {
          //   var coss = {};
          //   keys.forEach(function(key) {
          //     if(dict[key].ko_h && dict[key].ko_h.length > 2) {
          //       var hang = dict[key].ko_h.join(' / ');
          //       coss[hang] = coss[hang]||0;
          //       coss[hang]++;
          //     }
          //   });
          //   var mults = Object.keys(coss).map(function(key) { var val=coss[key]; if(val > 1) { return { key: key, occ: coss[key] }; }}).filter(function(val){ return !!val; });
          //   console.log(mults);
          // }
          return keys.length;
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
    },
    'setup-admins': function() {
      //superadmins
      var superAdmins = ['admin@bobbigmac.com'];
      superAdmins.forEach(function(superAdmin) {
        var user = Meteor.users.findOne({
          'emails.address': superAdmin
        });
        if(user && user._id) {
          if(!Roles.userIsInRole(user, 'superadmin')) {
            console.log('Assigning', superAdmin, 'to superadmin role');
            Roles.addUsersToRoles(user._id, 'superadmin');
          }
        }
      });

      //admins
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
    }
  });

  Meteor.call('setup-admins');
});