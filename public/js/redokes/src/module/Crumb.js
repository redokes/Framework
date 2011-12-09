Ext.define('Redokes.module.Crumb', {
	extend: 'Ext.button.Button',
	
	view: null,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		
	}
	
});