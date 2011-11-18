Ext.define('Modules.template.js.model.Template', {
	extend: 'Ext.data.Model',
	
	//Config
	idProperty: 'templateId',
    
	//Fields
	fields: [{
		name: 'templateId',
		type: 'int'
	},{
		name: 'groupId',
		type: 'int'
	},{
		name: 'title',
		type: 'string'
	},{
		name: 'safeTitle',
		type: 'string'
	},{
		name: 'hash',
		type: 'string'
	},{
		name: 'sortOrder',
		type: 'int'
	},{
		name: 'thumb',
		type: 'string'
	},{
		name: 'url',
		type: 'string'
	},{
		name: 'absoluteUrl',
		type: 'string'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		url : '/template/template/get-grid-records',
		api: {
			read: '/template/template/get-grid-records'
		},
		reader: {
			idProperty: 'templateId',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		}
	}
	
});