Ext.define('Modules.scrape.js.view.ThumbView', {
	extend:'Ext.view.View',
	requires: [
		'Modules.scrape.js.model.Info'
	],
	
	modelCls: 'Modules.scrape.js.model.Info',
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
	
	initStore: function() {
		this.store = new Ext.data.Store({
			model: this.modelCls,
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