
Glyphs.permit('insert')
	.ifLoggedIn()
	.ifHasRole('admin')
	.apply();

Glyphs.permit('update')
	.ifLoggedIn()
	.ifHasRole('admin')
	.apply();

Glyphs.permit('remove')
	.ifLoggedIn()
	.ifHasRole('admin')
	.apply();