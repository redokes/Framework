Ext.define('Modules.template.js.Interface', {
	extend: 'Redokes.tab.Interface',
	
	height: 400,
	width: 800,
	
	tabTitleTemplate: '{title}',
	tabIconCls: 'contact-icon-16',
	tabClass: 'Modules.template.js.view.Edit',
	tabModel: 'Modules.template.js.model.Template',
	addFormClass: 'Modules.template.js.form.Template',
	
	initComponent: function() {
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTemplateView();
		this.initListeners();
	},
	
	initTemplateView: function() {
		this.templateView = Ext.create('Modules.template.js.ViewPanel', {
			title: 'Templates'
		});
		this.items.push(this.templateView);
	},
	
	initListeners: function() {
		this.templateView.dataView.on('itemdblclick', function(view, record, item, index) {
			this.setActiveTab(this.createTab(record));
		}, this);
		
		this.templateView.on('edit', function(view, records) {
			var numRecords = records.length;
			for (var i = 0; i < numRecords; i++) {
				this.createTab(records[i]);
			}
		}, this);
		
		this.templateView.on('delete', function(view, records) {
			var numRecords = records.length;
			var ids = [];
			for (var i = 0; i < numRecords; i++) {
				ids.push(records[i].data.templateId);
			}
			Ext.Ajax.request({
				scope: this,
				method: 'delete',
				url: '/template/rest/delete',
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
			this.reloadStore();
		}, this);
		
		this.on('edit', function() {
			this.reloadStore();
		}, this);
		
		this.on('update', function(form, action) {
			this.reloadStore();
		}, this);
	},
	
	reloadStore: function() {
		this.templateView.dataView.store.load();
	}
	
});