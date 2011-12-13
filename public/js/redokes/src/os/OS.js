Ext.define('Redokes.os.OS', {
	extend: 'Ext.util.Observable',
    singleton: true,
	
	///////////////////////////////////////////////////////////////////////////
	// Requires
	///////////////////////////////////////////////////////////////////////////
	requires:[
		'Redokes.module.Manager',
		'Redokes.service.Manager'
	],
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	config: {
		
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Properties
	///////////////////////////////////////////////////////////////////////////
	modules: false,
	
	/**
	* @type {RedAmp.module.Manager}
	* Module manager that handles all modules that are registered with the OS
	*/
	moduleManager: false,
	
	///////////////////////////////////////////////////////////////////////////
	// Events
	///////////////////////////////////////////////////////////////////////////
	/**
	* @event before-boot
	* Fires before the OS begins booting
	* @param {OS} os
	* @param {Object} config
	*/
   
   /**
	* @event boot
	* Fires when the OS has booted.
	* @param {OS} os
	*/
   
   /**
	* @event before-launch
	* Fires before the OS launches a module
	* @param {OS} os
	* @param {RedOkes.module.Module} module
	*/
   
   /**
	* @event launch
	* Fires when the OS launches a module.
	* @param {OS} os
	* @param {RedOkes.module.Module} module
	*/
	
	///////////////////////////////////////////////////////////////////////////
	// Inits / Bootup
	///////////////////////////////////////////////////////////////////////////
	constructor: function(config) {
		this.initConfig(config);
		this.callParent(arguments);
		this.boot();
	},
	
	boot: function() {
		this.onBeforeBoot();
		this.initServiceManager();
		this.initModuleManager();
		this.processRegistry();
		this.onBoot();
	},
	
	processRegistry: function() {
		// Look up auto start modules and services
		var modules = [
			'Redokes.test1.module.Test1'
		];
		Ext.require(modules, function() {
			var numModules = modules.length;
			for (var i = 0; i < numModules; i++) {
				this.moduleManager.register(modules[i]);
			}
		}, this);
	},
	
	//Debug
	fireEvent: function(){
		console.log('OS - ' + arguments[0]);
		return this.callParent(arguments);
	},
	
	initServiceManager: function(){
		this.serviceManager = Ext.create('Redokes.service.Manager', {
		});
		this.fireEvent('init-service-manager', this, this.serviceManager);
	},
	
	initModuleManager: function(){
		this.moduleManager = Ext.create('Redokes.module.Manager', {
		});
		this.fireEvent('init-module-manager', this, this.moduleManager);
	},
	
	
	///////////////////////////////////////////////////////////////////////////
	// On Events
	///////////////////////////////////////////////////////////////////////////
	onBeforeBoot: function() {
		this.fireEvent('before-boot', this, this.config);
	},
	
	onBoot: function() {
		this.fireEvent('boot', this, this.config);
	},
	
	onBeforeLaunch: function(module) {
		this.fireEvent('before-launch', this, module);
	},
	
	onLaunch: function(module) {
		this.fireEvent('launch', this, module);
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	launchModule: function(module) {
	},
	
	startService: function(service) {
	}
});
