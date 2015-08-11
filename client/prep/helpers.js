
var languages = [
  { key: 'tc', name: 'Chinese (T)', google: 'zh-TW', full: 'Chinese: Traditional', short: 'Chinese Trad.', tiny: 'CT' },
  { key: 'sc', name: 'Chinese (S)', google: 'zh-CN', full: 'Chinese: Simplified', short: 'Chinese Simpl.', tiny: 'CS' },
  { key: 'j', name: 'Japanese', google: 'ja', full: 'Japanese', short: 'Japanese', tiny: 'J' },
  //{ key: 'k', name: 'Korean', google: 'ko', full: 'Korean', short: 'Korean', tiny: 'K' },
  { key: 'e', name: 'English', google: 'en', full: 'English', short: 'English', tiny: 'E' }
];

var googleLangs = {};
var languageNames = {};
languages.forEach(function(lang) {
  googleLangs[lang.key] = lang.google;
  languageNames[lang.key] = lang;
});

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
UI.registerHelper('parseNumber', function (str) {
	str = (str+'').replace(/^[^\d]*(\d+)/igm, '$1');
	return parseInt('0'+str);
});
UI.registerHelper('propOfObj', function (key, obj) {
  return obj[key];
});
UI.registerHelper('keysOf', function (obj) {
	return Object.keys(obj);
});

UI.registerHelper('langs', function () {
  return languages;
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