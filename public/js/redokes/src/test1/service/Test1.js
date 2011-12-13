Ext.define('Redokes.test1.service.Test1', {
	extend: 'Redokes.service.Service',
	
	config: {
		name: 'test1',
		title: 'Test 1',
		services: []
	},
	
	initListeners: function() {
		this.addOsEvent('test1event');
		
		this.onOsEvent('ready', function() {
			console.log('os is ready this is test 1');
		}, this);
		
		window.test1 = this;
		this.callParent(arguments);
	},
	
	test1: function() {
		return;
		console.log('this is test 1 method about to fire the event');
		this.fireOsEvent('test1event', this);
	}
	
});