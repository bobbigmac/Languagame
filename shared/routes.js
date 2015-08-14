Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loading'
});

var currentUser = {
  ready: function() {
    var user = Meteor.user();
    return (user === null || typeof user !== "undefined");
  }
};

if(Meteor.isClient) {
	Router.route('/admin', {
		template: 'admin',
		waitOn: function() {
			return [
				currentUser,
				Meteor.subscribe('admin-stats'),
				Meteor.subscribe('user-scores'),
				//Meteor.subscribe('all-glyphs'),
				Meteor.subscribe('all-glyphsets'),
				Meteor.subscribe('possible-glyphsets')
			];
		}
	});
}

if(Meteor.isClient) {
	Glyphsetsets = new Mongo.Collection('glyphsetsets');
	if(Meteor.isClient) {
		Glyphsetsets.find().observe({
			added: function (gss) {
				Session.set('loading', false);
			},
			changed: function (gss, oldGss) {
				Session.set('loading', false);
			},
			removed: function (gss, oldGss) {
				Session.set('loading', false);
			}
		});
	}
}

Router.route('/', {
	template: 'glyphsetstable',
	waitOn: function() {
		return [
			currentUser
		];
	},
	data: function() {

		changePlayerScore(0);
		
		Tracker.autorun(function() {
			var userId = Meteor.userId();
			if(userId) {
				customSubHandle = Meteor.subscribe('tumbler');
			} else {
				customSubHandle = Meteor.subscribe('tumbler', Session.get("playerScore"));
			}

			$('.correct,.incorrect').removeClass('correct').removeClass('incorrect');
		});
	}
});