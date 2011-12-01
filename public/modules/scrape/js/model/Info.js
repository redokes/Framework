Ext.define('Modules.scrape.js.model.Info', {
	extend: 'Ext.data.Model',
	
	//Config
	idProperty: 'scrapeId',
    
	//Fields
	fields: [{
		name: 'scrapeId',
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
	},{
		name: 'url',
		type: 'string'
	},{
		name: 'depth',
		type: 'int'
	},{
		name: 'complete',
		type: 'int'
	},{
		name: 'currentStep',
		type: 'int'
	},{
		name: 'thumb',
		type: 'string'
	},{
		name: 'publicUrl',
		type: 'string'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		url : '/scrape/process/get-grid-records',
		api: {
			read: '/scrape/process/get-grid-records'
		},
		reader: {
			idProperty: 'scrapeId',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		}
	}
	
});