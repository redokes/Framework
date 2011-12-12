Ext.define('Redokes.module.Module', {
	extend: 'Ext.util.Observable',
	
	config: {
		name: null,
		title: '',
		os: null
	},
	
	
	constructor: function(config) {
		this.initConfig(config);
		
		// Make sure there is a name
		if (this.getName() == null) {
			console.warn('[' + this.self.getName() + ']' + ' - Please set a name for this module');
		}
		
		this.init();
		this.initListeners();
		
		// Call the parent
		return this.callParent(arguments);
	},
	
	init: function() {
		
	},
	
	initListeners: function() {
		
	},
	
	onBeforeLaunch: function() {
		
	},
	
	launchModule: function() {
		this.onBeforeLaunch();
		this.getOs().launchModule(this);
	},
	
	addOsEvent: function() {
		this.os.addEvents(arguments);
	},
	
	onOsEvent: function(eventName, fn, scope) {
		this.os.on(eventName, fn, scope);
	},
	
	fireOsEvent: function() {
		this.os.fireEvent.apply(this.os, arguments);
	}
	
});