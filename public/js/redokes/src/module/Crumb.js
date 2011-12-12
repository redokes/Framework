Ext.define('Redokes.module.Crumb', {
	extend: 'Ext.button.Button',
	
	breadcrumb: null,
	view: null,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
	},
	
	initListeners: function() {
		this.on('click', this.onClick, this);
	},
	
	onClick: function() {
		this.breadcrumb.setCrumb(this);
	}
	
});