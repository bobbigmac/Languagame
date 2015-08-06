
UI.registerHelper('log', function (val) {
	console.log(val);
});

UI.registerHelper('not', function (val) {
  return !val;
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

var googleLangs = {
  e: 'en',
  tc: 'zh-TW',
  sc: 'zh-CN',
  j: 'ja',
  //k: 'ko',
};
var languageNames = {
	e: { name: 'English', short: 'English', tiny: 'E' },
	tc: { name: 'Chinese: Traditional', short: 'Chinese Trad.', tiny: 'CT' },
	sc: { name: 'Chinese: Simplified', short: 'Chinese Simpl.', tiny: 'CS' },
  j: { name: 'Japanese', short: 'Japanese', tiny: 'J' },
	k: { name: 'Korean', short: 'Korean', tiny: 'K' },
};
UI.registerHelper('googleLangs', function () {
	return googleLangs;
});
UI.registerHelper('googleLangOf', function (lang) {
  return googleLangs[lang];
});
UI.registerHelper('languageName', function (lang) {
  return (languageNames[lang] && languageNames[lang].name);
});
UI.registerHelper('shortLanguageName', function (lang) {
  return (languageNames[lang] && languageNames[lang].short);
});
UI.registerHelper('tinyLanguageName', function (lang) {
  return (languageNames[lang] && languageNames[lang].tiny);
});