Ext.define('Redokes.module.Test1', {
	extend: 'Redokes.module.Viewable',
	
	config: {
		name: 'test1',
		title: 'Test 1',
		os: null
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
		console.log('this is test 1 method about to fire the event');
		this.fireOsEvent('test1event', this);
	}
	
});