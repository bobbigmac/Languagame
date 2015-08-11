
saveOrUpdateGlyphset = function(glyphset) {
  if(glyphset) {
    var matchLangs = ['j', 'sc', 'tc', 'k'];

    var filter = {};
    matchLangs.forEach(function(lang) {
      if(glyphset[lang]) {
        filter[lang] = glyphset[lang];
      }
    });

    if(!glyphset.live) {
      glyphset.live = true;
    }
    if(!glyphset.created) {
      glyphset.created = (new Date());
    }
    glyphset.modified = (new Date());

    var existing = Glyphsets.findOne(filter);
    if(existing) {
      return Glyphsets.update({ _id: existing._id }, { $set: glyphset });
    } else {
      return Glyphsets.insert(glyphset);
    }
  }
};

saveOrUpdateGlyph = function(glyph) {
  if(glyph) {
    var filter = {};
    if(glyph._id) {
      filter._id = glyph._id;
    }
    else if(glyph.value) {
      filter.value = glyph.value;
    }

    var existing = Glyphs.findOne(filter);
    if(existing) {
      return Glyphs.update({ _id: existing._id }, { $set: glyph });
    } else {
      return Glyphs.insert(glyph);
    }
  }
};

kanjiDic = false;
var unloadKanjiDicTimer = false;
loadKanjiDictionary = function() {
  var dictionary = {};

  if(unloadKanjiDicTimer) {
    Meteor.clearTimeout(unloadKanjiDicTimer);
    unloadKanjiDicTimer = false;
  }
  unloadKanjiDicTimer = Meteor.setTimeout(function() {
    console.log('Unloading kanjiDic');
    kanjiDic = false;
  }, 60*60*1000);

  if(kanjiDic) {
    return kanjiDic;
  }
  
  //load hiragana
  var hiraganaStr = Assets.getText('sources/hiragana-pronounce.json');
  var hiragana = {};
  if(hiraganaStr) {
    var hiraganaArr = JSON.parse(hiraganaStr);
    hiraganaArr.forEach(function(pair) {
      hiragana[pair.hira] = pair.pro;
      dictionary[pair.hira] = {
        type: 'hira',
        pro: pair.pro
      }
    });
  }
  //console.log('hiragana', hiragana);

  //load katakana and map to hiragana
  var katakanaStr = Assets.getText('sources/katakana-pronounce.json');
  var katakana = {};
  if(katakanaStr) {
    var katakanaArr = JSON.parse(katakanaStr);
    katakanaArr.forEach(function(pair) {
      katakana[pair.kata] = pair.pro;
      dictionary[pair.kata] = {
        type: 'kata',
        pro: pair.pro,
        hira: Object.keys(hiragana).map(function(hira) {
          return (hiragana[hira] === pair.pro ? hira : false);
        }).filter(function(val) { return !!val; }).join()
      }
    });
  }
  //console.log('katakana', katakana);

  //set katakana for each hiragana
  Object.keys(hiragana).forEach(function(hira) {
    dictionary[hira].kata = Object.keys(katakana).map(function(kata) {
      return (katakana[kata] === hiragana[hira] ? kata : false);
    }).filter(function(val) { return !!val; }).join()
  });
  //console.log('dictionary', dictionary);

  //load hangul
  var hangulStr = Assets.getText('sources/hangul-pronounce.json');
  var hangul = {};
  if(hangulStr) {
    var hangulArr = JSON.parse(hangulStr);
    hangulArr.forEach(function(pair) {
      hangul[pair['char']] = pair.pro;
      dictionary[pair['char']] = {
        type: 'hang',
        pro: pair.pro,
        usage: pair.hang
      }
    });
  }
  //console.log('hangul', hangul);
  
  //load sub/parent glyphs
  var subGlyphsStr = Assets.getText('sources/kradfile.utf8');
  var subGlyphs = {};
  var parentGlyphs = {};
  if(subGlyphsStr) {
    var rawSubGlyphs = subGlyphsStr.split(/\n+/);
    rawSubGlyphs.forEach(function(subRowText, pos) {
      if(!(subRowText[0] === '#')) {
        var subRowArray = subRowText.split(/\s+:\s+/);
        var parentGlyph = subRowArray[0];

        subGlyphs[parentGlyph] = subRowArray[1].split(/\s+/).map(function(subGlyph) {
          subGlyph = subGlyph.trim();
          if(subGlyph) {
            if(!parentGlyphs[subGlyph]) {
              parentGlyphs[subGlyph] = [];
            }
            parentGlyphs[subGlyph].push(parentGlyph);
            return subGlyph;
          }
        }).filter(function(subGlyph) {
          return !!subGlyph;
        });

      }
    });
  }

  //load main radical
  var radicalsStr = Assets.getText('sources/khangxi-radicals-official.json');
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

  var str = Assets.getText('sources/kanjidic2-lite.xml');
  var result = xml2js.parseStringSync(str);

  //load full kanjidic
  if(result && typeof result == 'object' && result.kanjidic2 && result.kanjidic2.character && result.kanjidic2.character instanceof Array) {
    var dict = result.kanjidic2.character;
    if(dict) {
      console.log('Parsing kanjidic2', str.length, 'bytes...', dict.length, 'entries');
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
                      //TODO: could add romano pronounciation
                    }
                    if(type == 'ja_kun') {
                      type = 'hira';
                      //TODO: could add romano pronounciation
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
              literalEntry.hasRadical = radicalNum;
            }

            if(subGlyphs && subGlyphs[literal]) {
              literalEntry.sub = subGlyphs[literal];
            }

            literalEntry.type = 'kan';
            dictionary[literal] = literalEntry;
          }
        }
      });
      return dictionary;
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

  if(!kanjiDic) {
    kanjiDic = loadKanjiDictionary();
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

              //TODO: This matches method needs some tweak, it's letting some 
              //  characters through on multiple sets (see 10,000)
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
    PossibleGlyphsets.remove({});

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

          var active = Glyphsets.findOne(filter, { fields: { _id: 1 }});
          if(active) {
            possible.active = active._id;
          }

          var symbols = {};
          if(possible.j) {
            if(!symbols[possible.j]) {
              symbols[possible.j] = [];
            }
            symbols[possible.j].push('j');
          }
          if(possible.tc) {
            if(!symbols[possible.tc]) {
              symbols[possible.tc] = [];
            }
            symbols[possible.tc].push('tc');
          }
          if(possible.sc) {
            if(!symbols[possible.sc]) {
              symbols[possible.sc] = [];
            }
            symbols[possible.sc].push('sc');
          }
          if(possible.k) {
            if(!symbols[possible.k]) {
              symbols[possible.k] = [];
            }
            symbols[possible.k].push('k');
          }

          Object.keys(symbols).forEach(function(kanji) {
            //var kanji = (possible.j || possible.tc || possible.sc);
            if(kanjiDic && kanji) {
              var details = kanjiDic[kanji];
              if(details) {

                if(details.ekan) {
                  if(!possible.ekan) {
                    possible.ekan = [];
                  }
                  possible.ekan = possible.ekan.concat(details.ekan);
                }


                symbols[kanji].forEach(function(lang) {
                  possible['meta_'+lang] = details;
                });
                //TODO: Don't think I want to merge all keys directly onto possible.
                //      Most belong on the glyph, rather than on the glyphset.
                // for(var key in details) {
                //   if(details[key] && !possible[key]) {
                //     possible[key] = details[key];
                //   }
                // }



                //If I have a japanese pronunciation, but no possible.j, add this glyph for japanese too
                if(!possible.j && (details.kata || details.hira)) {
                  possible.j = kanji;
                }
                //If I have a korean pronunciation, but no possible.k, add this glyph for korean too
                if(!possible.k && (details.ko_r || details.ko_h)) {
                  possible.k = kanji;
                }
              }
            }
          });

          possible.live = false;
          var existing = PossibleGlyphsets.findOne(filter, { fields: { _id: 1 }});
          if(existing) {
            //console.log('Updating', existing._id, 'with', Object.keys(possible));
            PossibleGlyphsets.update({ _id: existing._id }, { $set: possible });
          } else {
            //console.log('Inserting new', Object.keys(possible));
            PossibleGlyphsets.insert(possible);
          }
        } else {
          console.log('No key matches for ', possible);
        }
      }
    });
  }

  //console.log('Done saving all possibles, now may publish')
  PossibleGlyphsets.update({ live: false }, { $set: { live: true }}, { multi: true });

  return possibles.length;
}