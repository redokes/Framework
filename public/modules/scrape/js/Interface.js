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
		this.initThumbView();
		this.initListeners();
//		this.initGrid();
	},
	
	initThumbView: function() {
		this.thumbViewPanel = Ext.create('Modules.scrape.js.view.ThumbPanel', {
			title: 'Sites'
		});
		this.items.push(this.thumbViewPanel);
	},
	
	initListeners: function() {
		this.thumbViewPanel.dataView.on('itemdblclick', function(view, record, item, index) {
			this.setActiveTab(this.createTab(record));
		}, this);
		
		this.thumbViewPanel.on('edit', function(view, records) {
			var numRecords = records.length;
			for (var i = 0; i < numRecords; i++) {
				this.createTab(records[i]);
			}
		}, this);
		
		this.thumbViewPanel.on('delete', function(view, records) {
			var numRecords = records.length;
			var ids = [];
			for (var i = 0; i < numRecords; i++) {
				ids.push(records[i].data.scrapeId);
			}
			Ext.Ajax.request({
				scope: this,
				method: 'delete',
				url: '/scrape/rest/delete',
				params: {
					ids: Ext.encode(ids)
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					this.reloadStore();
				}
			});
		}, this);
		
		this.on('add', function() {
//			this.reloadStore();
		}, this);
		
		this.on('edit', function() {
			this.reloadStore();
		}, this);
		
		this.on('update', function(form, action) {
			this.reloadStore();
		}, this);
	},
	
	reloadStore: function() {
		this.thumbViewPanel.dataView.store.load();
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
	}
	
});