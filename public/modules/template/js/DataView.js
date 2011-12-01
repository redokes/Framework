Ext.define('Modules.template.js.DataView', {
	extend:'Ext.view.View',
	requires: [
		'Modules.template.js.model.Template'
	],
	
	store: false,
	tpl: false,
	itemSelector: 'div.template-thumb',
	overItemCls: 'template-thumb-hover',
	trackOver: true,
	selectedItemCls: 'template-thumb-selected',
	multiSelect: true,
	autoScroll: true,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initTpl();
		this.initListeners();
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
	
	initStore: function() {
		this.store = new Ext.data.Store({
			model: 'Modules.template.js.model.Template',
			remoteSort: true,
			pageSize: 20,
			autoLoad: true
		});
	},
	
	initTpl: function() {
		this.tpl = Ext.create('Ext.XTemplate',
			'<tpl for=".">',
				'<div class="template-thumb">',
					'<div class="template-thumb-wrap">',
						'<img src="{thumb}" />',
					'</div>',
					'<div class="template-thumb-title">{title}</div>',
				'</div>',
			'</tpl>'
		)
	},
	
	initListeners: function() {
		
	}
	
});