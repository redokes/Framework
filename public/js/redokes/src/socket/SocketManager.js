Ext.define('Redokes.socket.SocketManager', {
	extend: 'Ext.util.Observable',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	config:{
		url: '',
		timeout: 3000,
		namespaces: {}
	},
	
	constructor: function(config) {
		this.addEvents('initclient');
		this.namespaces = {};
        this.initConfig(config);
//		this.createNamespace('');
		window.sockets = this;
    },
	
	/**
	 * Makes sure the namespace exists and creates a client object
	 * to manage the namespace connection
	 */
	connectToNamespace: function(name) {
		// Check if this namespace exists or not
		if (!this.namespaces[name]) {
			// Doesn't exist so we need to create it and connect
			// Check if global namespace or other namespace
			if (name.length) {
				
				// Tell the global namespace to create this sub namespace
				this.namespaces[''].socket.emit('connectToNamespace', {
					name: name
				}, this.onConnectToNamespace.bind(this));
			}
			else {
				// This is the global namespace
				// Create the client object to make the namespace connection
				this.initClient(name);
			}
		}
	},
	
	onConnectToNamespace: function(params) {
		// Init the client object to make the namespace connection
		this.initClient(params.name);
	},
	
	/**
	 * Deprecated
	 */
	createNamespace: function(name) {
		console.log('createNamespace is deprecated. use connectToNamespace');
		this.connectToNamespace(name);
	},
	
	/**
	 * Creates a client object to manage the namespace connection
	 */
	initClient: function(name) {
		this.log('Init cient ' + name);
		
		/**
		 * Create the client object for the namespace connection and keep track
		 * of it in the namespaces propery
		 */
		var client = Ext.create('Redokes.socket.Client', {
			url: this.url,
			namespace: name
		});
		this.setClient(name, client)
		
		this.log('Made it here');
		
		// Fire an event for setting up the client object
		this.fireEvent('initclient', this.getClient(name));
		this.log('fired');
	},
	
	/**
	 * Returns the client for the specified namespace if it exists
	 */
	getClient: function(name) {
		if (this.namespaces[name] != null) {
			return this.namespaces[name];
		}
		return false;
	},
	
	setClient: function(name, client) {
		this.namespaces[name] = client;
	},
	
	/**
	 * Disconnects the namespace connection if it exists
	 */
	removeNamespace: function(name) {
		var client = this.getClient(name);
		if (client) {
			client.disconnect();
//			delete this.namespaces[name];
		}
	}
});