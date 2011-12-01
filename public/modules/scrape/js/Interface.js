Ext.define('Modules.scrape.js.Interface', {
	extend: 'Redokes.tab.Interface',
	
	height: 400,
	width: 800,
	
	tabTitleTemplate: '{scrapeId}',
	tabIconCls: 'contact-icon-16',
	tabClass: 'Modules.scrape.js.ImportWizard',
	tabModel: 'Modules.scrape.js.model.Info',
	addFormClass: 'Modules.scrape.js.Form',
	
	initComponent: function() {
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initGrid();
		this.initListeners();
	},
	
	initGrid: function() {
		this.grid = Ext.create('Modules.scrape.js.view.Grid', {
			title: 'Scraped Sites',
			iconCls: 'grid-icon'
		});
		
		this.grid.on('edit', function(view, records) {
			var numRecords = records.length;
			for (var i = 0; i < numRecords; i++) {
				this.createTab(records[i]);
			}
		}, this);
		
		this.items.push(this.grid);
	},
	
	initListeners: function() {
		
	}
	
});