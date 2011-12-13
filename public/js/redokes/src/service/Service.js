Ext.define('Redokes.service.Service', {
	extend: 'Ext.util.Observable',
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	config: {
		name: null,
		manager: null,
		autoStart: true
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Init Functions
	///////////////////////////////////////////////////////////////////////////
	constructor: function(config) {
		this.initConfig(config);
		
		// Make sure there is a name
		if (this.getName() == null) {
			console.error('[' + this.self.getName() + ']' + ' - Please set a name for this service');
		}
		
		this.init();
		if(this.autoStart){
			this.start();
		}
		
		// Call the parent
		return this.callParent(arguments);
	},
	
	init: function() {},

	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	start: function(){
		console.log('Service - start ' + this.self.getName());
	},
	
	stop: function(){
		console.log('Service - start ' + this.self.getName());
	}
});