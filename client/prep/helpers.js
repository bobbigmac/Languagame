
UI.registerHelper('not', function (val) {
  return !val;
});
UI.registerHelper('equals', function (a, b) {
  return a == b;
});
UI.registerHelper('propOfObj', function (key, obj) {
  return obj[key];
});
var googleLangs = {
  e: 'en',
  tc: 'zh-TW',
  sc: 'zh-CN',
  j: 'ja',
};
UI.registerHelper('googleLangOf', function (lang) {
  return googleLangs[lang];
});