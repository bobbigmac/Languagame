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
		
		changePlayerScore(0);

		Tracker.autorun(function() {
			$('.correct,.incorrect').removeClass('correct').removeClass('incorrect');
			Session.set('loadingNewGlyphs', true);

		  Meteor.subscribe('glyphSet',
		    Session.get('atGlyphSet'),
		    Session.get('startNum'),
		    Session.get('endNum'),
		    function(inArg) {
		      Session.set('loadingNewGlyphs', false);
		      window.setTimeout(nudgeColumns, 20);
		    });
		});
	}
});