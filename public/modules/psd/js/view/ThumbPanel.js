Ext.define('Modules.psd.js.view.ThumbPanel', {
	extend:'Ext.panel.Panel',
	requires: [
		'Modules.psd.js.view.ThumbView'
	],
	autoScroll: true,
	
	initComponent: function() {
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.addEvents('edit', 'delete');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTopBar();
		this.initDataView();
	},
	
	initTopBar: function() {
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock: 'top'
		});
		this.dockedItems.push(this.topBar);
		
		this.topBar.add({
			text: 'Edit',
			iconCls: 'edit',
			scope: this,
			handler: this.editSelected
		},'-',{
			text: 'Delete',
			iconCls: 'close',
			scope: this,
			handler: this.deleteSelected
		})
	},
	
	initDataView: function() {
		this.dataView = Ext.create('Modules.psd.js.view.ThumbView', {
			
		});
		this.items.push(this.dataView);
	},
	
	getSelected: function() {
		return this.dataView.getSelectionModel().getSelection();
	},
	
	editSelected: function() {
		var records = this.getSelected();
		this.fireEvent('edit', this, records);
	},
	
	
	deleteSelected: function() {
		var records = this.getSelected();
		this.fireEvent('delete', this, records);
	}
	
});