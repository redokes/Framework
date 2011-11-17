Ext.define('Modules.template.js.ViewPanel', {
	extend:'Ext.panel.Panel',
	requires: [
		'Modules.template.js.DataView'
	],
	
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
			iconCls: 'edit',
			scope: this,
			handler: this.editSelected
		},'-',{
			iconCls: 'close',
			scope: this,
			handler: this.deleteSelected
		})
	},
	
	initDataView: function() {
		this.dataView = Ext.create('Modules.template.js.DataView', {
			
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