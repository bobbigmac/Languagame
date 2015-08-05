
importPossibles = function(limit) {
  limit = (limit || 9999999999);

  var possibles = [];
  var usePaths = [
    'both-chinese-vs-japanese.json',
    'chinese-traditional-vs-chinese-simplified.json',
    'commonchinesecharacters-1-1000.json',
    'commonchinesecharacters-1001-2000.json',
    'commonchinesecharacters-2001-3000.json',
    'commonchinesecharacters-3001-4000.json',
    'commonchinesecharacters-4001-5000.json',
    'commonchinesecharacters-5001-6000.json',
    'commonchinesecharacters-6001-7000.json',
    'thejapanesepage.com-1-1000.json',
    'wiki-kanji-by-concept-1173.json'
  ];

  function mergeArrayOfArrays(a) {
    if(a && a.some && a.some(function(sub) {
      return (sub instanceof Array);
    })) {
      var members = [];
      a.forEach(function(sub) {
        if(sub instanceof Array) {
          members = members.concat(sub);
        } else {
          members.push(sub);
        }
      });
      return members;
    }
    return a;
  }

  usePaths.forEach(function (filename, pos) {
    try {
      var str = Assets.getText('sources/'+filename);
      
      if(str && str.length) {
        var data = JSON.parse(str);
        
        var sample = (data instanceof Array ? data[0] : data);
        console.log(filename, str.length, Object.keys(sample));

        if(filename.indexOf('commonchinesecharacters-') === 0) {
          data = data.map(function(cleanMe) {
            if(cleanMe['e'] && cleanMe['e'] instanceof Array) {
              var english = [];
              var pronounce = [];
              var example = [];
              
              cleanMe['e'].forEach(function(e) {
                if(e.cpr) {
                  english.push(e.d);
                  pronounce.push(e.cpr);
                } else if(e.d) {
                  example = e.d;
                }
              });

              cleanMe['e'] = english;
              cleanMe['cpr'] = pronounce;
              cleanMe['cex'] = (example+'').replace(/words containing.*:/igm, '').split(',').map(function(str) { return (str+'').trim(); });
            }
            return cleanMe;
          });
        }
        data.forEach(function(d, dataPos) {
          if(d) {
            var matches = [];
            possibles.forEach(function(possible, pos) {

              var langs = Object.keys(d);
              langs.forEach(function(lang) {
                if(possible[lang] === d[lang]) {
                  matches[pos] = matches[pos] || 0;
                  matches[pos]++;
                }
              });

              if(matches[pos]) {
                //update existing record
                for(var lang in d) {
                  var val = d[lang];
                  if(val) {
                    if((lang === 'jpop' || lang === 'cpop') && typeof val === 'string') {
                      val = parseInt(val);
                    }

                    if(possible[lang] !== val) {
                      if(lang === 'e') {
                        possible['e'] = possible['e']||{};
                        if(d['j']) {
                          possible['e']['j'] = d['e'];
                        }
                        if(d['tc']||d['sc']) {
                          if(possible['e']['c']) {
                            possible['e']['c'].concat(mergeArrayOfArrays(d['e']));
                          } else {
                            possible['e']['c'] = mergeArrayOfArrays(d['e']);
                          }
                        }
                      } else {
                        if(possible[lang]) {
                          if(!(possible[lang] instanceof Array)) {
                            possible[lang] = [possible[lang]];
                          }
                          possible[lang].push(val);
                        } else {
                          possible[lang] = val;
                        }
                      }
                    }
                  }
                }
              }
            });

            if(!matches[pos]) {
              //add new record
              possibles.push(d);
            }
          }
        });

      }
    } catch(err) {
      console.log(err);
    }
  });

  var bonusSimplToTradText = Assets.getText('sources/'+'chinese-simplified-vs-chinese-traditional-large.json');
  var tradSimpPairs = false;
  var tradToSimp = false;
  if(bonusSimplToTradText) {
    tradSimpPairs = JSON.parse(bonusSimplToTradText);
    if(tradSimpPairs && tradSimpPairs.length) {
      tradToSimp = {};
      console.log('tradSimpPairs', tradSimpPairs.length);
      tradSimpPairs.forEach(function(pair) {
        tradToSimp[pair.tc] = pair.sc;
      });
    }
  }

  var warned = 0;
  console.log('Saving', possibles.length, 'possibles');
  if(possibles.length) {
    PossibleGlyphs.remove({});

    var keyLangs = ['j', 'tc', 'sc'];
    possibles.forEach(function(possible, pos) {
      if(pos < limit) {

        var filter = {};

        var strength = 0;
        keyLangs.forEach(function(lang) {
          if(possible[lang]) {
            filter[lang] = possible[lang];
            strength++;
          }
        });

        if(tradToSimp) {
          var needSc = (possible.tc && !possible.sc);
          if(needSc) {
            if(tradToSimp[possible.tc]) {
              possible.sc = tradToSimp[possible.tc];
            } else {
              possible.sc = possible.tc;
            }
          }
        }

        if(strength) {
          if(possible.jpop) {
            possible.jpop = parseInt(possible.jpop);
          }
          if(possible.cpop) {
            possible.cpop = parseInt(possible.cpop);
          }
          if(possible.jpop && possible.cpop) {
            possible.pop = Math.floor((possible.jpop + possible.cpop) / 2);
          } else if(possible.cpop) {
            possible.pop = possible.cpop;
          } else if(possible.jpop) {
            possible.pop = possible.jpop;
          }

          var existing = PossibleGlyphs.findOne(filter, { fields: { _id: 1 }});
          if(existing) {
            //console.log('Updating', existing._id, 'with', Object.keys(possible));
            PossibleGlyphs.update({ _id: existing._id }, { $set: possible });
          } else {
            //console.log('Inserting new', Object.keys(possible));
            PossibleGlyphs.insert(possible);
          }
        } else {
          console.log('No key matches for ', possible);
        }
      }
    });
  }

  return possibles.length;
}