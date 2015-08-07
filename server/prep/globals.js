
loadKanjiDictionary = function() {
  var radicalsStr = Assets.getText('sources/'+'khangxi-radicals-official.json');
  var radicals = {};
  var radicalNums = {};
  if(radicalsStr) {
    var rawRadicals = JSON.parse(radicalsStr);
    rawRadicals.forEach(function(radical, pos) {
      //num/rad
      radicals[''+radical.num] = radical.rad.filter(function(str) {
        if(str) {
          radicalNums[''+str] = radical.num;
          return true;
        }
      });
    });
    //console.log(JSON.stringify(radicals));
  }

  var str = Assets.getText('sources/'+'kanjidic2-lite.xml');
  console.log('Parsing kanjidic2', str.length);

  var result = xml2js.parseStringSync(str);

  if(result && typeof result == 'object' && result.kanjidic2 && result.kanjidic2.character && result.kanjidic2.character instanceof Array) {
    var dict = result.kanjidic2.character;
    var obj = {};
    if(dict) {
      var warned = 0;
      dict.forEach(function(cha, pos) {
        var literal = ((cha.literal && cha.literal instanceof Array && cha.literal[0]) || cha.literal);
        if(literal) {
          var literalEntry = {};

          var rmGroup = cha['reading_meaning'] && cha['reading_meaning'][0] && cha['reading_meaning'][0]['rmgroup'] && cha['reading_meaning'][0]['rmgroup'][0];
          if(rmGroup) {
            var meanings = rmGroup.meaning;
            if(meanings && meanings.length) {
              meanings.forEach(function(meaning) {
                if(typeof meaning === 'string') {
                  if(!literalEntry.ekan) {
                    literalEntry.ekan = [];
                  }
                  literalEntry.ekan.push(meaning);
                } else if(typeof meaning === 'object') {
                  if(meaning._ && meaning.$.m_lang) {
                    if(!literalEntry[meaning.$.m_lang]) {
                      literalEntry[meaning.$.m_lang] = [];
                    }
                    literalEntry[meaning.$.m_lang].push(meaning._);
                  }
                }
              });
            }

            var readings = rmGroup.reading;
            if(readings && readings.length) {
              readings.forEach(function(reading) {
                if(typeof reading === 'object') {
                  if(reading._ && reading.$.r_type) {
                    var type = reading.$.r_type;
                    if(type == 'ja_on') {
                      type = 'kata';
                    }
                    if(type == 'ja_kun') {
                      type = 'hira';
                    }
                    if(type == 'korean_r') {
                      type = 'ko_r';
                    }
                    if(type == 'korean_h') {
                      type = 'ko_h';
                    }
                    if(!literalEntry[type]) {
                      literalEntry[type] = [];
                    }
                    literalEntry[type].push(reading._);
                  }
                }
              });
            }

            var radicalNum = false;
            var radicalRads = false;
            var radValues = (cha.radical && cha.radical.length && cha.radical[0] && cha.radical[0].rad_value);
            if(radValues && radValues.length) {
              radValues.forEach(function(radical) {
                if(typeof radical === 'object') {
                  if(radical._ && radical.$.rad_type === 'classical') {
                    radicalNum = parseInt(radical._);
                  }
                }
              });
            }

            if(radicalNums && radicalNums[literal]) {
              literalEntry.isRadical = radicalNums[literal];
            } else if(radicalNum !== false) {
              literalEntry.hasRadical = radicalNum;//radicals[''+radicalNum];
            }

            // if(warned < 20 && (literalEntry.hasRadical)) {
            //   console.log(literal, literalEntry);
            //   warned++;
            // }

            obj[literal] = literalEntry;
          }
        }
      });
      return obj;
    }
  } else {
    console.log('Parsed kanjidic2 but did not get kanjidic2 root element or type was incorrect.');
  }
};

importPossibles = function(limit) {
  limit = (limit || 9999999999);

  var possibles = [];
  var usePaths = [
    'both-chinese-vs-japanese.json',
    'top800-chinese-vs-japanese-vs-korean.json',
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

  function onlyAnsi(eng) {
    //clean eng strings which contain non-anglo chars
    for(var pos = 0; pos < eng.length; pos++) {
      if(eng.charCodeAt(pos) > 255) {
        eng = false;
        break;
      }
    }
    return eng;
  };
  function whenTruthy(val) {
    return !!val;
  };
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

  var kanjiDic = loadKanjiDictionary();

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
      //console.log('tradSimpPairs', tradSimpPairs.length);
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
          if(possible.xpop) {
            possible.xpop = parseInt(possible.xpop);
          }
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

          if(possible.e) {
            var e = possible.e;
            if(typeof e === 'string') {
              possible.e = onlyAnsi(e);
              if(!e) {
                delete possible.e;
              }
            }
            else if(e instanceof Array) {
              possible.e = mergeArrayOfArrays(e);
              if(possible.e && possible.e.length) {
                possible.e = possible.e.map(onlyAnsi).filter(whenTruthy);
              }
            }
            else if(e.j || e.c) {

              if(e.j) {
                possible.e.j = mergeArrayOfArrays(e.j);
                if(possible.e.j && possible.e.j.length) {
                  possible.e.j = possible.e.j.map(onlyAnsi).filter(whenTruthy);
                }
                if(possible.e.j && possible.e.j.length) {
                  possible.ej = possible.e.j;
                }
              }

              if(e.c) {
                possible.e.c = mergeArrayOfArrays(e.c);
                if(possible.e.c && possible.e.c.length) {
                  possible.e.c = possible.e.c.map(onlyAnsi).filter(whenTruthy);
                }
                if(possible.e.c) {
                  possible.ec = possible.e.c;
                }
              }

              delete possible.e;
            }
          }

          var active = Glyphs.findOne(filter, { fields: { _id: 1 }});
          if(active) {
            possible.active = active._id;
          }

          var kanji = (possible.j || possible.tc || possible.sc);
          if(kanjiDic && kanji) {
            var details = kanjiDic[kanji];
            if(details) {
              for(var key in details) {
                if(details[key] && !possible[key]) {
                  possible[key] = details[key];
                }
              }
              //If I have a japanese pronunciation, but no possible.j, add this glyph for japanese too
              if(!possible.j && (possible.e || possible.ekan || possible.ej || possible.ec) && (possible.kata || possible.hira)) {
                possible.j = kanji;
              }
              //If I have a korean pronunciation, but no possible.k, add this glyph for korean too
              if(!possible.k && (possible.e || possible.ekan || possible.ej || possible.ec) && (possible.ko_r || possible.ko_h)) {
                possible.k = kanji;
              }
            }
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