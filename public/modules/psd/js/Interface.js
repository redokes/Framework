Ext.define('Modules.psd.js.Interface', {
	extend: 'Redokes.tab.Interface',
	requires: [
		'Redokes.tab.Interface',
		'Modules.psd.js.view.Grid',
		'Modules.psd.js.model.Template'
	],
	
	height: 400,
	width: 800,
	
	tabTitleTemplate: '{title}',
	tabIconCls: 'contact-icon-16',
	tabClass: 'Modules.psd.js.Form',
	tabModel: 'Modules.psd.js.model.Template',
	addFormClass: 'Modules.psd.js.Form',
	
	initComponent: function() {
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initGrid();
	},
	
	initGrid: function(){
		this.grid = Ext.create('Modules.psd.js.view.Grid', {
			title: 'Psd Templates',
			iconCls: 'grid-icon'
		});
		
		this.grid.on('edit', function(view, records) {
			var numRecords = records.length;
			for (var i = 0; i < numRecords; i++) {
				this.createTab(records[i]);
			}
		}, this);
		
		this.items.push(this.grid);
	}

});