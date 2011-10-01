Ext.define('Modules.files.js.user.view.User', {
	extend: 'Ext.panel.Panel',
	
	//Config
	module: false,
	application: false,
	layout: 'fit',

    initComponent: function() {
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initTree();
	},
	
	initTree: function(){
		this.tree = Ext.create('Modules.files.js.user.view.Tree', {
		});
		this.items.push(this.tree);
	}
});