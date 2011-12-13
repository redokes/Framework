Ext.define('Redokes.shell.Shell', {
    extend: 'Ext.util.Observable',
    
	config: {
		os: null
	},
	
    constructor: function(config){
		this.initConfig(config);
		this.callParent(arguments);
		this.init();
	},
	
	init: function(){
		
	}
});