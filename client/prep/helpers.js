
currentUser = {
  ready: function() {
    var user = Meteor.user();
    return (user === null || typeof user !== "undefined");
  }
};

loadUserLangs = function() {
  var user = Meteor.user();
  if(user) {
    if(user && user.profile && user.profile.langs && user.profile.langs instanceof Array) {
      Session.set('langs', user.profile.langs);
    }
  }
};

var radicals = {"1":["一"],"2":["丨"],"3":["丶"],"4":["丿"],"5":["乙","⺄","乚"],"6":["亅"],"7":["二"],"8":["亠"],"9":["人","亻","𠆢"],"10":["儿"],"11":["入"],"12":["八"],"13":["冂"],"14":["冖"],"15":["冫"],"16":["几"],"17":["凵"],"18":["刀","刂"],"19":["力"],"20":["勹"],"21":["匕"],"22":["匚"],"23":["匸"],"24":["十"],"25":["卜"],"26":["卩","㔾"],"27":["厂"],"28":["厶"],"29":["又"],"30":["口"],"31":["囗"],"32":["土"],"33":["士"],"34":["夂"],"35":["夊"],"36":["夕"],"37":["大"],"38":["女"],"39":["子"],"40":["宀"],"41":["寸"],"42":["小"],"43":["尢","尣"],"44":["尸"],"45":["屮"],"46":["山"],"47":["巛","川","巜"],"48":["工"],"49":["己"],"50":["巾"],"51":["干"],"52":["幺"],"53":["广"],"54":["廴"],"55":["廾"],"56":["弋"],"57":["弓"],"58":["彐","彑"],"59":["彡"],"60":["彳"],"61":["心","忄","⺗"],"62":["戈"],"63":["戶","户","戸"],"64":["手","扌","龵"],"65":["支"],"66":["攴","攵"],"67":["文"],"68":["斗"],"69":["斤"],"70":["方"],"71":["无","旡"],"72":["日"],"73":["曰"],"74":["月"],"75":["木"],"76":["欠"],"77":["止"],"78":["歹","歺"],"79":["殳"],"80":["毋","母","⺟"],"81":["比"],"82":["毛"],"83":["氏"],"84":["气"],"85":["水","氺","氵"],"86":["火","灬"],"87":["爪","爫"],"88":["父"],"89":["爻"],"90":["爿","丬"],"91":["片"],"92":["牙"],"93":["牛","牜","⺧"],"94":["犬","犭"],"95":["玄"],"96":["玉","玊","王,","⺩"],"97":["瓜"],"98":["瓦"],"99":["甘"],"100":["生"],"101":["用"],"102":["田"],"103":["疋","⺪"],"104":["疒"],"105":["癶"],"106":["白"],"107":["皮"],"108":["皿"],"109":["目"],"110":["矛"],"111":["矢"],"112":["石"],"113":["示","礻"],"114":["禸"],"115":["禾"],"116":["穴"],"117":["立"],"118":["竹","⺮"],"119":["米"],"120":["糸","糹"],"121":["缶"],"122":["网","罒","⺲,罓,⺳"],"123":["羊","⺶","⺷"],"124":["羽"],"125":["老","耂"],"126":["而"],"127":["耒"],"128":["耳"],"129":["聿","⺻"],"130":["肉","⺼"],"131":["臣"],"132":["自"],"133":["至"],"134":["臼"],"135":["舌"],"136":["舛"],"137":["舟"],"138":["艮"],"139":["色"],"140":["艸","艹"],"141":["虍"],"142":["虫"],"143":["血"],"144":["行"],"145":["衣","衤"],"146":["襾","西","覀"],"147":["見"],"148":["角"],"149":["言","訁"],"150":["谷"],"151":["豆"],"152":["豕"],"153":["豸"],"154":["貝"],"155":["赤"],"156":["走","赱"],"157":["足","⻊"],"158":["身"],"159":["車"],"160":["辛"],"161":["辰"],"162":["辵","辶"],"163":["邑","阝"],"164":["酉"],"165":["釆"],"166":["里"],"167":["金","釒"],"168":["長","镸"],"169":["門"],"170":["阜","阝"],"171":["隶"],"172":["隹"],"173":["雨"],"174":["青","靑"],"175":["非"],"176":["面","靣"],"177":["革"],"178":["韋"],"179":["韭"],"180":["音"],"181":["頁"],"182":["風","𠘨"],"183":["飛"],"184":["食","飠"],"185":["首"],"186":["香"],"187":["馬"],"188":["骨"],"189":["高","髙"],"190":["髟"],"191":["鬥"],"192":["鬯"],"193":["鬲"],"194":["鬼"],"195":["魚"],"196":["鳥"],"197":["鹵"],"198":["鹿"],"199":["麥"],"200":["麻"],"201":["黃"],"202":["黍"],"203":["黑"],"204":["黹"],"205":["黽"],"206":["鼎"],"207":["鼓"],"208":["鼠"],"209":["鼻"],"210":["齊"],"211":["齒"],"212":["龍"],"213":["龜"],"214":["龠"]};

var languages = [
  { key: 'tc', name: 'Chinese (T)', google: 'zh-TW', full: 'Chinese: Traditional', short: 'Chinese Trad.', tiny: 'CT' },
  { key: 'sc', name: 'Chinese (S)', google: 'zh-CN', full: 'Chinese: Simplified', short: 'Chinese Simpl.', tiny: 'CS' },
  { key: 'j', name: 'Japanese', google: 'ja', full: 'Japanese', short: 'Japanese', tiny: 'J' },
  { key: 'k', name: 'Korean', google: 'ko', full: 'Korean', short: 'Korean', tiny: 'K' },
  { key: 'e', name: 'English', google: 'en', full: 'English', short: 'English', tiny: 'E' },
  { key: 'fr', name: 'French', google: 'fr', full: 'French', short: 'French', tiny: 'F' },
  { key: 'pt', name: 'Portuguese', google: 'pt-PT', full: 'Portuguese', short: 'Portu.', tiny: 'P' },
  { key: 'es', name: 'Spanish', google: 'es', full: 'Spanish', short: 'Spanish', tiny: 'S' }
];

googleLangs = {};
var languageNames = {};
var languageKeys = [];
languages.forEach(function(lang) {
  googleLangs[lang.key] = lang.google;
  languageNames[lang.key] = lang;
  languageKeys.push(lang.key);
});

//Session.setDefault("langs", languageKeys);
Session.setDefault("langs", defaultLangs);

btnPrimaryOnEnter = function(event, template) {
  if(event && event.which === 13) {
    if(template && template.$) {
      template.$(template.find('.btn-primary:last')).trigger('click');
    }
  }
};

UI.registerHelper('log', function (val) {
	console.log(val);
});

UI.registerHelper('not', function (val) {
  return !val;
});
UI.registerHelper('reverse', function (arr) {
  return (arr && arr instanceof Array && arr.reverse()) || arr;
});
UI.registerHelper('arrayContains', function (a, b) {
  return (a && a instanceof Array && a.indexOf(b) > -1);
});
UI.registerHelper('equals', function (a, b) {
  return a == b;
});
UI.registerHelper('gt', function (a, b) {
  return a > b;
});
UI.registerHelper('either', function (a, b) {
  return a || b;
});
UI.registerHelper('parseNumber', function (str) {
	str = (str+'').replace(/^[^\d]*(\d+)/igm, '$1');
	return parseInt('0'+str);
});
UI.registerHelper('propOfObj', function (key, obj) {
  return (obj && obj[key]);
});
UI.registerHelper('keysOf', function (obj) {
	return Object.keys(obj);
});

UI.registerHelper('sessionLangs', function () {
  var langs = Session.get('langs');
  if(!langs || !(langs instanceof Array)) {
    Session.set('langs', defaultLangs);
    langs = Session.get('langs');
  }
  return langs;
});
UI.registerHelper('langs', function () {
  var langs = Session.get('langs');
  if(!langs || !(langs instanceof Array)) {
    Session.set('langs', defaultLangs);
    langs = Session.get('langs');
  }
  var useLangs = (languages && languages.filter(function(langObj) {
    return (langs && langs.indexOf(langObj.key) > -1);
  }));
  return useLangs;
});
UI.registerHelper('activeGoogleLangs', function () {
  var langs = Session.get('langs');
  var filtered = {};
  langs.forEach(function(lang) {
    if(googleLangs[lang]) {
      filtered[lang] = googleLangs[lang];
    }
  });
  return filtered;
});
UI.registerHelper('googleLangs', function () {
	return googleLangs;
});
UI.registerHelper('googleLangOf', function (lang) {
  return googleLangs[lang];
});
UI.registerHelper('languageName', function (lang) {
  return (languageNames[lang] && (languageNames[lang].full || languageNames[lang].name));
});
UI.registerHelper('shortLanguageName', function (lang) {
  return (languageNames[lang] && languageNames[lang].short);
});
UI.registerHelper('tinyLanguageName', function (lang) {
  return (languageNames[lang] && languageNames[lang].tiny);
});
UI.registerHelper('radicalByNumber', function (number) {
  return radicals[''+number]||[number];
});