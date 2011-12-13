Ext.define('Redokes.shell.Shell', {
    extend: 'Ext.util.Observable',
    
	config: {
		os: null
	},
	
    constructor: function(config){
		this.initConfig(config);
		this.callParent(arguments);
		this.init();
		this.initListeners();
	},
	
	init: function(){
		
	},
	
	initListeners: function() {
		this.getOs().getModuleManager().on('launch', this.launchModule, this);
	},
	
	launchModule: function(manager, module) {
		
	}
});