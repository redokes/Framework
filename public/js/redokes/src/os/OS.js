Ext.define('Redokes.os.OS', {
	extend: 'Ext.util.Observable',
    singleton: true,
	
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
		this.initModuleManager();
		this.onBoot();
	},
	
	//Debug
	fireEvent: function(){
		console.log('OS - ' + arguments[0]);
		return this.callParent(arguments);
	},
	
	initModuleManager: function(){
		this.moduleManager = Ext.create('Redokes.module.Manager', {
		});
	},
	
	
	///////////////////////////////////////////////////////////////////////////
	// On Events
	///////////////////////////////////////////////////////////////////////////
	onBeforeBoot: function(){
		this.fireEvent('before-boot', this, this.config);
	},
	
	onBoot: function(){
		this.fireEvent('boot', this, this.config);
	},
	
	onBeforeLaunch: function(module){
		this.fireEvent('before-launch', this, module);
	},
	
	onLaunch: function(module){
		this.fireEvent('launch', this, module);
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	
	
	launch: function(module) {
		this.onBeforeLaunch(module);
		this.onLaunch(module);
	},

	
	/**
	 * This will really be generated on the backend
	 */
	loadModules: function() {
		return;
		var clsNames = [
			'Modules.template.js.Template',
			'Modules.scrape.js.Scrape',
			'Modules.navigation.js.Navigation',
			'Modules.page.js.Page',
			'Modules.psd.js.Psd',
			'Modules.redirect.js.Redirect',
			'Modules.scrape.js.Scrape',
			'Modules.wes.js.Wes'
		];
		Ext.require(clsNames, function() {
			this.registerModule(clsNames);
		}, this);
	}
});