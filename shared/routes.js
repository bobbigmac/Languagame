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

// if(Meteor.isClient) {
// 	Customs = new Mongo.Collection('customs');
// }

Router.route('/test', {
	template: 'test',
	waitOn: function() {
		return [currentUser]
	},
	data: function() {
		//doing nothing
	}
});

Router.route('/', {
	template: 'glyphsetstable',
	waitOn: function() {

		//customSubHandle = Meteor.subscribe('custom', Session.get("playerScore"));
		return [
			currentUser,
			//customSubHandle
		];
	},
	data: function() {

		changePlayerScore(0);
		
		Tracker.autorun(function() {
			$('.correct,.incorrect').removeClass('correct').removeClass('incorrect');

		  Meteor.subscribe('glyphsetSet',
		    Session.get('atGlyphSet'),
		    Session.get('startNum'),
		    Session.get('endNum'),
		    false,
		    function() {
		      window.setTimeout(nudgeColumns, 20);
		    }
		  );
		});
	}
});