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


}