
Router.route('/tumbler', {
	template: 'tumbler',
	waitOn: function() {
		return [
			currentUser
		];
	},
	data: function() {
		changePlayerScore(0);
		
		Tracker.autorun(function() {
			var langs = Session.get('langs');
			var userId = Meteor.userId();
			if(userId) {
				customSubHandle = Meteor.subscribe('tumbler', false, 3, langs);
			} else {
				customSubHandle = Meteor.subscribe('tumbler', Session.get("playerScore"), 3, langs);
			}

			$('.correct,.incorrect').removeClass('correct').removeClass('incorrect');
		});
	}
});
