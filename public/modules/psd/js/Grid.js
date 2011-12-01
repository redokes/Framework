Ext.namespace('Simon.psd');
Simon.psd.Grid = Ext.extend(Ext.ux.papercut.Grid, {
	title: '',
	table: 'psd_templates',
	primaryKey: 'psdId',
	sortField: 'title',
	sortDirection: 'ASC',
	processingPage: '/psd/private/',
	defaultAction: 'grid',
	
	//Columns to show on grid
	columns:[{
		dataIndex:'title',
		header: 'Title'
	}],

	//Fields to use
	fields: [
	  	'psdId',
		'title',
		'templateStyle'
	],

	//Filters the data
	filters:[{
		dataIndex: 'title',
		type: 'string'
	}],

	//Actions to perform on the data
	actions: [{
		action:'delete',
		display:'Delete',
		confirmMessage:'Are you sure you want to delete the selected items?',
		icon: '/js/ext/resources/icons/delete.gif'
	},{
		action:'convert-to-template',
		display:'Convert to Template'
	}]
});