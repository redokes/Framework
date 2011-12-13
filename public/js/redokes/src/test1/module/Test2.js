Ext.define('Redokes.test1.module.Test2', {
	extend: 'Redokes.module.Module',
	
	config: {
		name: 'test2',
		title: 'Test 2',
		services: [
			'Redokes.test1.service.Test2'
		]
	}
	
});