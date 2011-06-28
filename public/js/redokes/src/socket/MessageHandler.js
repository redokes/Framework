Ext.define('Redokes.socket.MessageHandler', {
	extend: 'Ext.util.Observable',
	config: {
		module:false,
		actions:{}
	},
	
	constructor: function(config) {
        this.initConfig(config);
		this.initActions();
        return this;
    },
	
	initActions: function() {
		Ext.apply(this, this.config.actions);
	},
	
	callAction: function(action, request){
		this[action](request);
	}
	
});