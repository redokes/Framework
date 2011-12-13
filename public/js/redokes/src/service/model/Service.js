Ext.define('Redokes.service.model.Service', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'instance'
	},{
		name: 'cls',
		type: 'string'
	},{
		name: 'name',
		type: 'string',
		defaultValue: ''
	},{
		name: 'running',
		typr: 'boolean',
		defaultValue: false
	}],
	proxy: {
		type: 'memory'
	}
});