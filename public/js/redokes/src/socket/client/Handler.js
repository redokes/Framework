Ext.define('Redokes.socket.client.Handler', {
	extend: 'Ext.util.Observable',
	
	config: {
		/**
		 * @cfg {Redokes.socket.client.Client} client
		 * The client to register this handler with
		 */
		client: null,
		
		/**
		 * @cfg {String} module
		 * Name of the module to listen for
		 */
		module:false,
		
		/**
		 * @cfg {Object} actions
		 * Object of action => function, of funtions to call when an action occurs
		 */
		actions: [],
		
		/**
		 * @cfg {Object} scope
		 * Scope to run the actions in
		 */
		scope: null
	},
	
	/**
     * @private
     * Constructor that inits all needed items
     */
	constructor: function(config) {
        this.initConfig(config);
		this.initClient();
		this.initActions();
        return this;
    },
	
	/**
     * If a client was passed auto register this handler
     */
	initClient: function(){
		if(this.client == null){
			return false;
		}
		this.client.registerHandler(this);
	},
	
	/**
     * Take all actions and add events for these actions
     */
	initActions: function(){
		//Add events for each action
		for(var action in this.actions){
			this.addEvents(action);
		}
	},
	
	/**
     * Call an action
	 * @param {String} action name of the action
	 * @param {Object} request the request object from the server
     */
	callAction: function(action, request){
		if(this.actions[action] == null){
			return false;
		}
		
		//Determine if there is a scope
		if(this.scope != null){
			Ext.bind(this.actions[action], this.scope)(this, request);
		}
		else{
			this.actions[action](this, request);
		}
		
		//Fire the event
		this.fireEvent(action, this, request);
	}
	
});