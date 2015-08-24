
Router.route('/pairs', {
	template: 'pairs',
	waitOn: function() {
		return [
			currentUser
		];
	},
	data: function() {
		//changePlayerScore(0);
		
		Tracker.autorun(function() {
			var langs = Session.get('langs');
			var userId = Meteor.userId();
			if(userId) {
				customSubHandle = Meteor.subscribe('pairs', false, 12, langs);
			} else {
				customSubHandle = Meteor.subscribe('pairs', Session.get("playerScore"), 12, langs);
			}
		});

		return Glyphsetsets.findOne();
	}
});
