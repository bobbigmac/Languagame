
Meteor.publish('custom', function(score) {
	var collection = "customs";
	var _id = Random.id();
	var val = { some: 'text', counter: 0 };

	this.added("customs", _id, val);

	var self = this;
	var incCounterTimeout = Meteor.setInterval(function() {
		val.counter++;
		self.changed(collection, _id, { counter: val.counter });
	}, 1000);

	//this.removed();
	this.onStop(function() {
		if(incCounterTimeout) {
			Meteor.clearInterval(incCounterTimeout);
			//console.log('stopped');
		}
	});//cleanup

	//this.error();//report
	//this.stop();

	this.ready();
});

// Meteor.methods({
// 	'stop-custom': function() {
// 		self.stop();
// 	}
// });