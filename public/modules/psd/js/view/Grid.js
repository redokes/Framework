/**
 *
 */
Ext.define('Modules.psd.js.view.Grid', {
	extend: 'Ext.grid.Panel',
	requires: [
		'Modules.psd.js.model.Template'
	],
	
	//Config
	processingPage: '/psd/process/',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function() {
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initToolbar();
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initSelectionModel();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			dock: 'top',
			items:[{
				scope: this,
				text: 'Edit',
				icon: '/resources/icons/edit-16.png',
				handler: function(){
					this.fireEvent('edit', this, this.selModel.getSelection());
				}
			}]
		});
		
		this.dockedItems.push(this.toolbar);
	},
	
	initColumns: function() {
		this.columns = [{
			header: 'ID',
			dataIndex: 'psdId'
		},{
			header: 'Title',
			dataIndex: 'title',
			flex: 1
		}];
	},
	
	initStore: function() {
		this.store = new Ext.data.Store({
			model: 'Modules.psd.js.model.Template',
			remoteSort: true,
			pageSize: 20
		});
	},
	
	initPager: function() {
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			dock: 'top',
			displayInfo: true
		});
		this.dockedItems.push(this.pager);
	},
	
	initSelectionModel: function() {
		this.selModel = Ext.create('Ext.selection.CheckboxModel', {
			mode: 'SIMPLE'
		});
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	}
	
});