Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loading'
});

if(Meteor.isClient) {
	Router.onBeforeAction(function() {
		loadUserLangs();
		this.next();
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
	template: 'games',
	waitOn: function() {
		return [currentUser];
	},
	data: function() {
		//TODO: Pull these from registered games.
		return [
			{ name: 'Tumbler', icon: 'table', path: 'tumbler' },
			{ name: 'Pairs', icon: 'clone', path: 'pairs' },
		];
	}
});

Router.route('/words', {
	template: 'words',
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

				Tracker.autorun(function () {
					Meteor.subscribe('detailed-glyphs', Session.get('words-detail'), Session.get('langs'));
				});

				var sets = Glyphsets.find({ _id: { $in: Object.keys(strength) }}).fetch();
				sets = sets.map(function(set) {
					var newSet = {};
					var str = strength[set._id];
					Object.keys(str).forEach(function(lang) {
						newSet[lang] = { word: set[lang], strength: str[lang], lang: lang };
					});
					newSet._id = set._id;
					return newSet;
				});

				sets.sort(function(a, b) {
					if(a.e && b.e) {
						return (a.e.strength > b.e.strength ? -1 : 1);
					}
				});

				return sets;
			}
		}
	}
});