
Security.permit('insert')
	.collections([Audios])
	.ifLoggedIn()
	.ifHasRole('admin')
	.apply();

Security.permit('update')
	.collections([Audios])
	.ifLoggedIn()
	.ifHasRole('admin')
	.apply();

Security.permit('remove')
	.collections([Audios])
	.ifLoggedIn()
	.ifHasRole('admin')
	.apply();

Security.permit('download')
	.collections([Audios])
	.apply();