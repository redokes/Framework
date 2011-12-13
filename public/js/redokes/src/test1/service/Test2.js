Ext.define('Redokes.test1.service.Test2', {
	extend: 'Redokes.service.Service',
	
	config: {
		name: 'test2',
		title: 'Test 2',
		autoStart: true
	},
	
	init: function() {
		Ext.TaskManager.start({
			scope: this,
			run: this.fake,
			interval: 1000
		});
	},
	
	fake: function() {
		this.fireEvent('fake', this);
	}
	
});