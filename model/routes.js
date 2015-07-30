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

Router.route('/', {
	template: 'glyphstable',
	waitOn: function() {
		return [
			currentUser
		];
	},
	data: function() {
		Session.set('loadingNewGlyphs', true);

		Tracker.autorun(function() {
		  Meteor.subscribe('glyphSet',
		    Session.get('atGlyphSet'),
		    Session.get('startNum'),
		    Session.get('endNum'),
		    function(inArg) {
		      Session.set('loadingNewGlyphs', false);
		    });
		});
	}
});