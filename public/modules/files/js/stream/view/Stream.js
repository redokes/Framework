Ext.define('Modules.files.js.stream.view.Stream', {
	extend: 'Ext.view.View',
	
	//Requires
	requires:[
		'Modules.files.js.model.Stream'
	],

	//Config
    itemSelector: 'div.stream-item',

    initComponent: function() {
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
		this.initTemplate();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			scope: this,
			model: 'Modules.files.js.model.Stream'
		});
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="stream-item">{text}</div>',
			'</tpl>'
		);
	},
	
	addMessage: function(record){
		this.store.add(record);
	}
});