Ext.define('Modules.files.js.stream.view.StreamPanel', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Modules.files.js.stream.view.Stream'
	],

	layout: 'fit',
	title: 'Stream',

    initComponent: function() {
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initView();
	},
	
	initView: function(){
		this.view = Ext.create('Modules.files.js.stream.view.Stream');
		this.items.push(this.view);
	}
});