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

Router.route('/strengths', {
	template: 'strengths',
	waitOn: function() {
		return [
			currentUser,
			Meteor.subscribe('my-strengths'),
			Meteor.subscribe('my-glyphsets')
		];
	},
	data: function() {
		var userId = Meteor.userId();
		if(userId) {
			var user = Meteor.user();
			var strength = (user && user.strength);
			if(strength) {

				var sets = Glyphsets.find({ _id: { $in: Object.keys(strength) }}).fetch();
				sets = sets.map(function(set) {
					var newSet = {};
					var str = strength[set._id];
					Object.keys(str).forEach(function(lang) {
						newSet[lang] = { word: set[lang], strength: str[lang], lang: lang };
					});
					return newSet;
				});

				sets.sort(function(a, b) {
					return (a.e.strength > b.e.strength ? -1 : 1);
				});

				return sets;
			}
		}
	}
});