Glyphsets = new Mongo.Collection('glyphsets');
PossibleGlyphsets = new Mongo.Collection('possible-glyphsets');
Glyphs = new Mongo.Collection('glyphs');

//OldPossibleGlyphs = new Mongo.Collection('possible-glyphs');
//OldGlyphs = new Mongo.Collection('glyphs');

var AudioStore = new FS.Store.GridFS("audios");
Audios = new FS.Collection("audios", {
  stores: [AudioStore]
});