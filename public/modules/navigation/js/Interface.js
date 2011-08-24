Ext.define('Modules.navigation.js.Interface', {
	extend:'Ext.panel.Panel',
	layout:'border',
	height:400,
	
	initComponent: function() {
		this.items = this.items || [];
		this.initManager();
		this.callParent(arguments);
	},
	
	initManager: function(){
		this.manager = Ext.create('Modules.navigation.js.NavigationManager', {
			title: 'Navigation',
			iconCls: 'grid-icon',
			region:'center'
		});
		this.items.push(this.manager);
	}
	
});