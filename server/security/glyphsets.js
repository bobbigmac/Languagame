
Glyphsets.permit('update')
	.ifLoggedIn()
	.ifHasRole('admin')
	.apply();

PossibleGlyphsets.permit('update')
	.ifLoggedIn()
	.ifHasRole('admin')
	.apply();