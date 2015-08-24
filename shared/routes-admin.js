
if(Meteor.isClient) {
	Router.route('/admin', {
		template: 'admin',
		waitOn: function() {
			return [
				currentUser,
				Meteor.subscribe('admin-stats'),
				Meteor.subscribe('user-scores'),
				Meteor.subscribe('possible-glyphsets', Session.get('possible-filter'), Session.get('possible-sort'))
			];
		}
	});

	Router.route('/admin/unaudio', {
		name: 'unaudioGlyphs',
		template: 'unaudioGlyphs',
		waitOn: function() {
			return [
				currentUser,
				Meteor.subscribe('admin-stats'),
				Meteor.subscribe('unaudio-glyphs', Session.get('langs'))
			]
		}
	});
}