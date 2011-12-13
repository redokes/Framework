Ext.define('Redokes.service.model.Service', {
	extend: 'Ext.data.Model',
	fields: [
		'instance',
		'cls',
		'name'
	],
	proxy: {
		type: 'memory'
	}
});