Ext.define('Redokes.test1.module.Test1', {
	extend: 'Redokes.module.Module',
	
	config: {
		name: 'test1',
		title: 'Test 1',
		services: [
			'Redokes.test1.service.Test1'
		]
	},
	
	init: function() {
		this.getOs().getServiceManager().onServiceStart('test2', function(service) {
			console.log('set listeners on ' + service.getName());
			service.on('fake', function(service) {
				console.log('fired from ' + service.getName());
				console.log('fake event was fired and i caught it over here');
				service.stop();
			}, this);
		}, this);
	}
	
});