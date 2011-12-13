Ext.define('Redokes.module.Test2', {
	extend: 'Redokes.module.Module',
	
	config: {
		name: 'test2',
		title: 'Test 2',
		os: null
	},
	
	initListeners: function() {
		this.onOsEvent('fake', function() {
			console.log('seeing if it errors');
		}, this);
		
		this.onOsEvent('test1event', function() {
			console.log('test 1 event was fired, this is test 2');
		}, this);
		
		this.onOsEvent('ready', function() {
			console.log('os is ready this is test 2');
		}, this);
	}
	
});