Ext.define('Redokes.module.Module', {
	extend: 'Ext.util.Observable',
	
	config: {
		name: null,
		title: '',
		manager: null,
		services: [],
		os: null
	},
	
	constructor: function(config) {
		this.initConfig(config);
		
		// Make sure there is a name
		if (this.getName() == null) {
			console.warn('[' + this.self.getName() + ']' + ' - Please set a name for this module');
		}
		
		this.initServices();
		this.init();
		
		// Call the parent
		return this.callParent(arguments);
	},
	
	init: function() {
		
	},
	
	initServices: function() {
		this.getOs().getServiceManager().register(this.getServices());
	}
	
});