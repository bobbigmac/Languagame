Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loading'
})

Router.route('/', {
	template: 'glyphstable',
	waitOn: function() {
		return false;
	}
	//data: function () { return Items.findOne({_id: this.params._id}); }
});