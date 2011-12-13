Ext.define('Redokes.shell.Tree', {
	extend: 'Ext.tree.Panel',
	
	config: {
		shell: null,
		store: null
	},
	
	rootVisible: false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initListeners();
	},
	
	initStore: function() {
		var children = [];
		var moduleStore = this.getShell().getOs().getModuleManager().getStore();
		moduleStore.each(function(record) {
			var instance = record.get('instance');
			var items = this.processMenu(instance.getMenu(), instance);
			var numItems = items.length;
			for (var i = 0; i < numItems; i++) {
				children.push(items[i]);
			}
		}, this);
		
		this.store = Ext.create('Ext.data.TreeStore', {
			root: {
				expanded: true,
				children: children
			}
		});
	},
	
	processMenu: function(menu, module) {
		var items = [];
		var numItems = menu.length;
		for (var i = 0; i < numItems; i++) {
			var item = menu[i];
			var leaf = true;
			var children = [];
			if (item.items != null && item.items.length) {
				leaf = false;
				children = this.processMenu(item.items, module);
			}
			var node = {
				text: item.display,
				leaf: leaf,
				children: children,
				params: item.params,
				module: module
			}
			items.push(node);
		}
		return items;
	},
	
	initListeners: function() {
		this.on('itemclick', function(tree, record) {
			var module = record.raw.module;
			var params = record.raw.params;
			module.launch(params);
		}, this);
	}
	
});