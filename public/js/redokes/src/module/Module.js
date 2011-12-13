Ext.define('Redokes.module.Module', {
	extend: 'Ext.util.Observable',
	
	config: {
		name: null,
		title: '',
		manager: null,
		services: [],
		os: null,
		
		menu: [{
			parent: false,
			display: '',
			icon: {
				small: '',
				medium: '',
				large: ''
			},
			params: {}
		}],
		launchParams: {}
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Properties
	///////////////////////////////////////////////////////////////////////////
	running: false,
	
	constructor: function(config) {
		this.initConfig(config);
		this.callParent(arguments);
		
		// Make sure there is a name
		if (this.getName() == null) {
			console.warn('[' + this.self.getName() + ']' + ' - Please set a name for this module');
		}
		
		this.initServices();
		this.init();
		this.initListeners();
	},
	
	init: function() {
		
	},
	
	initListeners: function() {
		
	},
	
	initServices: function() {
		this.getOs().getServiceManager().register(this.getServices());
	},
	
	onBeforeLaunch: function(params) {
		this.setLaunchParams(params);
		return this.fireEvent('before-launch', this, params);
	},
	
	launch: function(params) {
		if (this.onBeforeLaunch(params) !== false) {
			this.fireEvent('launch', this, params);
		}
	},
	
	quit: function() {
		if (!this.isRunning()) {
			return false;
		}
		
		this.fireEvent('quit', this);
	},
	
	applyParams: function() {
		
	},
	
	handleLaunchParams: function() {
		
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Checkers
	///////////////////////////////////////////////////////////////////////////
	isRunning: function() {
		return this.running;
	}
	
});