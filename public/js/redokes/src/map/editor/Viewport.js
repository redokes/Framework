Ext.define('Redokes.map.editor.Viewport', {
	extend:'Ext.container.Viewport',
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.items.push(Ext.create('Redokes.map.editor.Editor'));
	}
	
});