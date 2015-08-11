
Glyphsets.permit('update')
	.ifLoggedIn()
	.ifHasRole('admin')
	.apply();