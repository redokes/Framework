Ext.define('Redokes.shell.Tree', {
	extend: 'Ext.tree.Panel',
	
	config: {
		shell: null
	},
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.buildMenu();
		this.initListeners();
	},
	
	buildMenu: function(menu, parent) {
		parent = parent || this;
		if (menu.length) {
			var button = Ext.create('Ext.button.Button', {
				text: menu.display
			})
			parent.add(button);
			if (menu.items != null && menu.items.length) {
				this.buildMenu(menu.items, button);
			}
		}
	},
	
	initListeners: function() {
		this.on('afterrender', function() {
			this.buildMenu();
		}, this);
	}
	
});