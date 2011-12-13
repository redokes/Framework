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
			region: 'center',
			layout: 'card'
		});
	},
	
	initWest: function() {
		this.west = Ext.create('Ext.panel.Panel', {
			title: 'West',
			region: 'west',
			width: 200,
			layout: 'fit'
		});
	},
	
	initLauncher: function() {
		this.launcher = Ext.create('Redokes.shell.Tree', {
			shell: this
			
		});
		this.west.add(this.launcher);
	},
	
	getCenter: function() {
		return this.center;
	},
	
	setActiveView: function(view) {
		this.getCenter().getLayout().setActiveItem(view);
	},
	
	launchModule: function(manager, module) {
		if (module.isViewable != null && module.isViewable) {
			this.getCenter().add(module.view);
			this.setActiveView(module.view);
		}
	}
	
});