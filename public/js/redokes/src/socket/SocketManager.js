Ext.define('Redokes.socket.SocketManager', {
	extend: 'Ext.util.Observable',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	config:{
		url: '',
		timeout: 3000,
		game:false,
		namespaces:{}
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
				}, Ext.bind(function(params) {
					
					// Init the client object to make the namespace connection
					this.initClient(params.name);
				}, this));
			}
			else {
				// This is the global namespace
				// Create the client object to make the namespace connection
				this.initClient(name);
			}
		}
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
		this.namespaces[name] = Ext.create('Redokes.socket.Client', {
			url: this.url,
			namespace: name
		});
		
		this.log('Made it here');
		
		// Fire an event for setting up the client object
		this.fireEvent('initclient', this.namespaces[name]);
		this.log('fired');
	},
	
	getClient: function(name) {
		if (this.namespaces[name] != null) {
			return this.namespaces[name];
		}
		return false;
	},
	
	/**
	 * Disconnects the namespace connection if it exists
	 */
	removeNamespace: function(name) {
		if (this.namespaces[name]) {
			this.namespaces[name].disconnect();
//			delete this.namespaces[name];
		}
	}
});