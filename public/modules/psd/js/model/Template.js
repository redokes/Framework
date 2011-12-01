Ext.define('Modules.psd.js.model.Template', {
	extend: 'Ext.data.Model',
	
	//Config
	idProperty: 'psdId',
    
	//Fields
	fields: [{
		name: 'psdId',
		type: 'int'
	},{
		name: 'title',
		type: 'string'
	},{
		name: 'slug',
		type: 'string'
	},{
		name: 'hash',
		type: 'string'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		url : '/psd/private/get-grid-records',
		api: {
			read: '/psd/private/get-grid-records'
		},
		reader: {
			idProperty: 'psdId',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		}
	}
	
});