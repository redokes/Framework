Ext.define('Redokes.shell.Viewport', {
    extend: 'Redokes.shell.Shell',
    
	config: {
		viewport: null
	},
	
    init: function() {
		this.initCenter();
		this.initWest();
		this.initViewport();
		this.initLauncher();
	},
	
	initViewport: function() {
		this.viewport = Ext.create('Ext.Viewport', {
			layout: 'border',
			items: [
				this.center,
				this.west
			]
		});
	},
	
	initCenter: function() {
		this.center = Ext.create('Ext.panel.Panel', {
			title: 'Center',
			region: 'center'
		});
	},
	
	initWest: function() {
		this.west = Ext.create('Ext.panel.Panel', {
			title: 'West',
			region: 'west',
			width: 200
		});
	},
	
	initLauncher: function() {
		this.launcher = Ext.create('Redokes.shell.Tree', {
			shell: this,
			store: false
		});
		this.west.add(this.launcher);
	}
});