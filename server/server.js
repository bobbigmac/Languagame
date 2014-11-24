
var numberOfGlyphs = 0;
Meteor.startup(function () {

  if(!glyphs.findOne({})) {
    var testChars = [
      { tc: '電', sc: '电', j: '電', e: 'electricity' },
      { tc: '買', sc: '买', j: '買', e: 'buy' },
      { tc: '開', sc: '开', j: '開', e: 'open' },
      { tc: '東', sc: '东', j: '東', e: 'east' },
      { tc: '車', sc: '车', j: '車', e: 'car, vehicle' },
      { tc: '紅', sc: '红', j: '紅', e: 'red (crimson in Japanese)' },
      { tc: '馬', sc: '马', j: '馬', e: 'horse' },
      { tc: '無', sc: '无', j: '無', e: 'nothing' },
      { tc: '鳥', sc: '鸟', j: '鳥', e: 'bird' },
      { tc: '熱', sc: '热', j: '熱', e: 'hot' },
      { tc: '時', sc: '时', j: '時', e: 'time' },
      { tc: '語', sc: '语', j: '語', e: 'spoken language' },
      { tc: '假', sc: '假', j: '仮', e: 'false' },
      { tc: '罐', sc: '罐', j: '缶', e: 'Tin can' },
      { tc: '佛', sc: '佛', j: '仏', e: 'Buddha' },
      { tc: '惠', sc: '惠', j: '恵', e: 'favour' },
      { tc: '德', sc: '德', j: '徳', e: 'moral, virtue' },
      { tc: '拜', sc: '拜', j: '拝', e: 'kowtow, pray to, worship' },
      { tc: '黑', sc: '黑', j: '黒', e: 'black' },
      { tc: '冰', sc: '冰', j: '氷', e: 'ice' },
      { tc: '兔', sc: '兔', j: '兎', e: 'rabbit' },
      { tc: '妒', sc: '妒', j: '妬', e: 'jealousy' },
      { tc: '聽', sc: '听', j: '聴', e: 'listen' },
      { tc: '實', sc: '实', j: '実', e: 'real' },
      { tc: '證', sc: '证', j: '証', e: 'certificate, proof' },
      { tc: '龍', sc: '龙', j: '竜', e: 'dragon' },
      { tc: '賣', sc: '卖', j: '売', e: 'sell' },
      { tc: '龜', sc: '龟', j: '亀', e: 'turtle, tortoise' },
      { tc: '藝', sc: '艺', j: '芸', e: 'art, arts' },
      { tc: '戰', sc: '战', j: '戦', e: 'fight, war' },
      { tc: '繩', sc: '绳', j: '縄', e: 'rope' },
      { tc: '關', sc: '关', j: '関', e: 'to close, relationship' },
      { tc: '鐵', sc: '铁', j: '鉄', e: 'iron, metal' },
      { tc: '圖', sc: '图', j: '図', e: 'picture, diagram' },
      { tc: '團', sc: '团', j: '団', e: 'group, regiment' },
      { tc: '轉', sc: '转', j: '転', e: 'turn' },
      { tc: '廣', sc: '广', j: '広', e: 'wide, broad' },
      { tc: '惡', sc: '恶', j: '悪', e: 'bad, evil' },
      { tc: '豐', sc: '丰', j: '豊', e: 'abundant' },
      { tc: '腦', sc: '脑', j: '脳', e: 'brain' },
      { tc: '雜', sc: '杂', j: '雑', e: 'miscellaneous' },
      { tc: '壓', sc: '压', j: '圧', e: 'pressure, compression' },
      { tc: '雞', sc: '鸡', j: '鶏', e: 'chicken' },
      { tc: '價', sc: '价', j: '価', e: 'price' },
      { tc: '樂', sc: '乐', j: '楽', e: 'fun' },
      { tc: '氣', sc: '气', j: '気', e: 'air' },
      { tc: '廳', sc: '厅', j: '庁', e: 'hall, office' },
      { tc: '聲', sc: '声', j: '声', e: 'sound, voice' },
      { tc: '學', sc: '学', j: '学', e: 'learn' },
      { tc: '體', sc: '体', j: '体', e: 'body' },
      { tc: '點', sc: '点', j: '点', e: 'dot, point' },
      { tc: '貓', sc: '猫', j: '猫', e: 'cat' },
      { tc: '蟲', sc: '虫', j: '虫', e: 'insect' },
      { tc: '舊', sc: '旧', j: '旧', e: 'old' },
      { tc: '會', sc: '会', j: '会', e: 'can (verb), meeting' },
      { tc: '萬', sc: '万', j: '万', e: 'ten-thousand' },
      { tc: '盜', sc: '盗', j: '盗', e: 'thief' },
      { tc: '寶', sc: '宝', j: '宝', e: 'treasure' },
      { tc: '國', sc: '国', j: '国', e: 'country' },
      { tc: '醫', sc: '医', j: '医', e: 'medicine' },
      { tc: '麥', sc: '麦', j: '麦', e: 'wheat' },
      { tc: '雙', sc: '双', j: '双', e: 'pair' },
      { tc: '觸', sc: '触', j: '触', e: 'contact' }
    ];

    for(var i=0; i<testChars.length; i++)
    {
      testChars[i]._id = 'g'+i;
      glyphs.insert(testChars[i]);
    }
  }

  numberOfGlyphs = glyphs.find({}).count();
  console.log('Have %d glyphs', numberOfGlyphs);
});

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
