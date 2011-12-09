Ext.define('Modules.page.js.Interface', {
	extend: 'Redokes.tab.Interface',
	
	title: 'Pages',
	
	tabTitleTemplate: '{title}',
	tabIconCls: 'contact-icon-16',
	tabClass: 'Modules.page.js.view.Edit',
	tabModel: 'Modules.page.js.model.Template',
	addFormClass: 'Modules.page.js.form.Template',
	
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
		this.grid = Ext.create('Modules.page.js.Grid', {
			title: 'Pages'
		});
		this.items.push(this.grid);
	},
	
	initListeners: function() {
		this.grid.on('itemdblclick', function(view, record){
			this.setActiveTab(this.createTab(record));
		}, this);
		
		this.grid.on('edit', function(grid, records) {
			this.createTabs(records);
		}, this);
		
		this.on('add', function() {
			this.reloadStore();
		}, this);
		
		this.on('edit', function() {
			this.reloadStore();
		}, this);
	},
	
	reloadStore: function() {
		this.grid.store.load();
	}
	
});