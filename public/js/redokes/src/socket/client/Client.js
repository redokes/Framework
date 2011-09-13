Ext.define('Redokes.socket.client.Client', {
	extend: 'Ext.util.Observable',
	
	config:{
		/**
		 * @cfg {String} url
		 * The url of the node server
		 */
		url: '',
		
		/**
		 * @cfg {Numeric} port
		 * The port that the node server is running on
		 */
		port: false,
		
		/**
		 * @cfg {Numeric} timeout
		 * Time in milliseconds before the connection to the server will timeout
		 */
		timeout: 3000
	},
	
	/**
	 * @private {Object} handlers
	 * An object of handlers to use with this client
	 */
	handlers: {},
	
	/**
     * @private
     * Constructor that inits all the needed events, listeners and the socket
     */
	constructor: function(config) {
		this.handlers = {};
        this.initConfig(config);
        this.addEvents(
			'connect',
			'message',
			'disconnect'
		);
		if (this.port) {
			this.url += ':' + this.port;
		}
		this.initSocket();
		this.initListeners();
        return this;
    },
	
	/**
     * Attempts to connect the socket
     */
	connect: function(){
		this.socket.connect();
	},
    
	
	/**
     * Creates the socket
     */
    initSocket: function() {
		this.socket = io.connect(this.url);
	},
	
	/**
     * Adds listeners to the socket and chains those to local events/handlers
     */
	initListeners: function() {
		if (this.socket) {
			this.socket.on('connect', Ext.bind(function(){
				console.log('connect4d');
				this.fireEvent('connect', arguments);
			}, this));
			
			this.socket.on('message', Ext.bind(function(request){
				var params = {
					module:request.module,
					action:request.action
				};
				this.fireEvent('message', params);
				
				if (this.handlers[request.module]) {
					//Loop through and run all actions
					Ext.each(this.handlers[request.module], function(handler){
						handler.callAction(request.action, request);
					}, this);
				}
				
			}, this));
			
			this.socket.on('disconnect', Ext.bind(function(client){
				this.fireEvent('disconnect', arguments);
			}, this));
		}
	},
	
	/**
     * Registers a new handler for this client
	 * @param {Redokes.socket.client.Handler} handler
     */
	registerHandler: function(handler){
		console.log('register handler ' + handler.module);
		if(this.handlers[handler.module] == null){
			this.handlers[handler.module] = [];
		}
		this.handlers[handler.module].push(handler);
	},
	
	/**
     * Sends a message to the socket
     */
	send: function(module, action, data) {
		console.log('send time');
		this.socket.json.send({
			module: module,
    		action: action,
    		data: data
    	});
	}
});