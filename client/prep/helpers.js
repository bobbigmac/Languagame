
UI.registerHelper('log', function (val) {
	console.log(val);
});

UI.registerHelper('not', function (val) {
  return !val;
});
UI.registerHelper('equals', function (a, b) {
  return a == b;
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
};
UI.registerHelper('googleLangs', function () {
	return googleLangs;
});
UI.registerHelper('googleLangOf', function (lang) {
  return googleLangs[lang];
});