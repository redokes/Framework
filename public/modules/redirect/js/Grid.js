Ext.namespace('Simon.redirect');
Simon.redirect.Grid = Ext.extend(Ext.ux.papercut.Grid, {
	title: '',
	table: 'redirect',
	primaryKey: 'redirectId',
	sortField: 'requestString',
	sortDirection: 'ASC',
	height:400,
	processingPage: '/redirect/private/',
	defaultAction: 'grid',

	//Columns to show on grid
	columns: [{
		header:Simon.redirect.Language.models.redirect.fields.requestString.title,
		dataIndex:'requestString'
	},{
		header:Simon.redirect.Language.models.redirect.fields.redirectUrl.title,
		dataIndex:'redirectUrl'
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
		type: 'string'
		,dataIndex: 'requestString'
	},{
		type: 'string'
		,dataIndex: 'redirectUrl'
	}],

	//Actions to perform on the data
	actions: [{
		action:'delete',
		display:'Delete',
		confirmMessage:'Are you sure you want to delete the selected items?',
		icon: '/js/ext/resources/icons/delete.gif'
	}]
});