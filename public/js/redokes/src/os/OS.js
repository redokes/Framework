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
		moduleManager: null,
		serviceManager: null
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
		this.onBoot();
	},
	
	//Debug
	fireEvent: function(){
		console.log(this.self.getName() + ' - ' + arguments[0]);
		return this.callParent(arguments);
	},
	
	initServiceManager: function(){
		this.serviceManager = Ext.create('Redokes.service.Manager', {
			os: this
		});
		this.fireEvent('init-service-manager', this, this.serviceManager);
	},
	
	initModuleManager: function(){
		this.moduleManager = Ext.create('Redokes.module.Manager', {
			os: this
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
	launch: function(module) {
	}
});
