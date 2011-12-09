Ext.define('Modules.template.js.Interface', {
	extend: 'Redokes.tab.Interface',
	
	title: 'Templates',
	
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
		this.thumbViewPanel = Ext.create('Modules.template.js.view.ThumbPanel', {
			title: 'Templates'
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
	}
	
});