Ext.define('Modules.redirect.js.Grid', {
	title: 'Redirects',
	processingPage: '/redirect/private/',

	columns: [{
		header: 'Request String',
		dataIndex: 'requestString'
	},{
		header: 'Redirect URL',
		dataIndex: 'redirectUrl'
	}],

	//Fields to use
	fields: [
	  	'redirectId',
	  	'requestString',
		'redirectUrl'
	],

	//Filters the data
	filters:[{
		type: 'numeric',
		dataIndex: 'redirectId'
	},{
		type: 'string',
		dataIndex: 'requestString'
	},{
		type: 'string',
		dataIndex: 'redirectUrl'
	}],

	//Actions to perform on the data
	actions: [{
		action:'delete',
		display:'Delete',
		confirmMessage:'Are you sure you want to delete the selected items?',
		icon: '/js/ext/resources/icons/delete.gif'
	}]
});