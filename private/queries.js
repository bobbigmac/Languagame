//console parsers

if(false) {

//commonchinesecharacters.com
//http://www.commonchinesecharacters.com/Lists/GeneralUse7000ChineseCharacters?Page=1
$('.common7000 tr').get().map(function(el, pos) { if(true) { el = $(el); return { tc: el.find('h6').text().trim(), w: el.find('td:first').text().trim(), e: el.find('p').get().map(function(s){ s=$(s); var pr=s.find('b').text().trim(); return { pr: pr||false, d: s.text().replace(pr, '').split(';').map(function(spr){ return spr.trim(); }) }; }) }; }});

//japanese.about.com
//http://japanese.about.com/od/kan2/a/100kanji.htm
$('table[border="1"] tr').get().map(function(tr) { tr=$(tr); var j=tr.find('a').text(); var w=tr.find('a').parent().text().replace(j, ''); return { j: j, w: parseInt(w), e: tr.text().replace(w, '').replace(j, '') }; });

//thejapanesepage.com
//http://thejapanesepage.com/node/kanji/dictionaryall.htm
if(typeof(jQuery) === 'undefined') { var scr = document.createElement('script'); scr.src = 'http://code.jquery.com/jquery-2.1.4.min.js'; $('head').appendChild(scr); }
$('font[color="red"]').remove();
$('a[target="textframe"]').get().map(function(el, pos) { el=$(el); return { w: pos+1,
    e: el.prevUntil('br', 'font[color="blue"]:last').text().split('-').map(function(s){ return (''+s.trim())||false; }),
    pr: el.prevUntil('br', 'font[size="2"]:last').find('i').text().split('-').map(function(s){ return (''+s.trim())||false; }), 
    j: el.prevUntil('br', 'font[size="5"]:last').text(), 
}; });

//https://en.wikipedia.org/wiki/List_of_kanji_by_concept
$('span.nowrap').get().map(function(el){ el=$(el); var j=el.find('a').text(); var e=el.text().replace(j, ''); return { j:j, e:e.split(';').map(function(s){ return s.trim()||false; }) } })

//https://en.wikipedia.org/wiki/Simplified_Chinese_characters
$('span[lang="zh-hant"]').get().map(function(el){ el=$(el); var han=el.text(); var cn=el.nextAll('span[lang="zh-cn"]:first').text(); return { hant: han.length === 1 ? han : false, cn: cn.length === 1 ? cn : false }}).filter(function(pair){ return pair.cn && pair.hant; });


//Traditional kanji radicals
//https://en.wikipedia.org/wiki/Table_of_Japanese_kanji_radicals
$('#collapsibleTable0 tr').get().map(function(el) { el=$(el); var ja=el.find('span[lang="ja"] a').text(); var e=el.find('td:nth-child(4)').text(); var ex=el.find('td:nth-child(7)').text(); return { e: e, ja: ja, ex: ex.split(/\s*/igm) }}).filter(function(a){ return a.e && a.ja; });

//Simplified kanji radicals
//https://en.wikipedia.org/wiki/Simplified_table_of_Japanese_kanji_radicals
$('#collapsibleTable0 tr').get().map(function(el) { el=$(el); var ja=el.find('span[lang="ja"] a').text(); var e=el.find('td:nth-child(4)').text(); var ex=el.find('td:nth-child(6)').text(); return { e: e, ja: ja, ex: ex.split(/\s*/igm), hira: el.find('td:nth-child(3)').text() }}).filter(function(a){ return a.e && a.ja; });


//Traditional vs Simplified
//http://www.sayjack.com/chinese/simplified-to-traditional-chinese-conversion-table/
$('dd a').get().map(function(el) { el=$(el); tc=el.text(); sc=el.parents('dl').find('dt a').text(); return { tc: tc, sc: sc }});
//also see http://www.sayjack.com/simplified/chinese/characters/page:1/


//ALL Kangxi radicals (with meaning)
//https://en.wikipedia.org/wiki/Kangxi_radical
$('table#collapsibleTable0 tr').get().map(function(el) { el=$(el); var num=el.find('td:first a').text(); var rad=el.find('span[lang="zh-Hant"]:first').text(); return (num && { num: parseInt(num), rad: rad.trim().replace('(', ' ').replace(')', ' ').replace(',', ' ').split(/\s+/) }); }).filter(function(el){ return !!el; });



//Hiragana and Katakana
//https://www.coscom.co.jp/hiragana-katakana/kanatable.html
if(typeof(jQuery) === 'undefined') { var scr = document.createElement('script'); scr.src = 'https://code.jquery.com/jquery-2.1.4.min.js'; $('head').appendChild(scr); };
function chunk(arr, n) {
    return arr.slice(0,(arr.length+n-1)/n|0).
           map(function(c,i) { return arr.slice(n*i,n*i+n); });
};
var keyed = {};
chunk($('.kanatable .seion,.kanatable .yoon,.kanatable .dakuon,.kanatable .yoodakuon,.kanatable .romaji').get().map(function(el){ el=$(el); return el.text(); }), 10).map(function(arr) { var both = chunk(arr, 5); return both[0].map(function(jap, pos) { if(jap && jap != '-' && both[1][pos] != '-') { keyed[jap] = both[1][pos]; return { jap: jap, e: both[1][pos] }}; }).filter(function(ex){ return !!ex; }); });
//keyed;
//
// similar, but flattened array
if(typeof(jQuery) === 'undefined') { var scr = document.createElement('script'); scr.src = 'https://code.jquery.com/jquery-2.1.4.min.js'; $('head').appendChild(scr); };
function chunk(arr, n) {
    return arr.slice(0,(arr.length+n-1)/n|0).
           map(function(c,i) { return arr.slice(n*i,n*i+n); });
};
var keyed = [];
chunk($('.kanatable .seion,.kanatable .yoon,.kanatable .dakuon,.kanatable .yoodakuon,.kanatable .romaji').get().map(function(el){ el=$(el); return el.text(); }), 10).map(function(arr) { var both = chunk(arr, 5); return both[0].map(function(jap, pos) { if(jap && jap != '-' && both[1][pos] != '-') { keyed[jap] = both[1][pos]; return { jap: jap, e: both[1][pos] }}; }).filter(function(ex){ return !!ex; }); }).map(function(arr) { keyed = keyed.concat(arr); return arr; });
JSON.stringify(keyed);


//Hangul
//https://www.zkorean.com/hangul/appearance



//Complete list of hangul (not mapped to aanything)
//http://lcweb2.loc.gov/diglib/codetables/9.3.html
$('table[summary] td[style]').get().map(function(el) { el=$(el); return { hang: el.text() }});


//pdf from http://www.korea.net/NewsFocus/Culture/view?articleId=110141



//Good breakdown of katakana vs hiragana vs traditional japanese:
//http://www.omniglot.com/writing/japanese_katakana.htm
//http://www.omniglot.com/writing/japanese_hiragana.htm


}