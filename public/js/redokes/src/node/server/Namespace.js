Ext.define('Redokes.node.server.Namespace', {
	extend: 'Ext.util.Observable',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	config: {
		io: null,
		socket: null,
		name: ''
	},
	
	constructor: function(config) {
		this.showLog();
		this.initConfig(config);
		this.log('Constructor');
		this.init();
		return this.callParent(arguments);
	},
	
	init: function() {
		if (this.name.length) {
			this.initNamespace(this.io.of('/' + this.name));
		}
		else {
			this.initNamespace(this.io.sockets);
		}
	},
	
	/**
	 * Sets up all of the listeners for a namespace when it is created. This
	 * includes the main global namespace
	 * @param {Namespace} namespace
	 */
	initNamespace: function(namespace) {
		this.log('Init namespace ' + namespace.name);
		this.initNamespaceListeners(namespace);
	},
	
	initNamespaceListeners: function(namespace) {

		/**
		 * All socket listeners will be set once the namespace has been connected to
		 */
		namespace.on('connection', function(socket) {
			this.log('Connected to namespace ' + socket.namespace.name);
			
			Ext.create('Redokes.socket.Socket', {
				socket: socket,
				namespace: namespace
			});
			
		}.bind(this));
	},
	
	/**
	 * Returns an object containing the store data for a given socket id
	 * @param {String} id
	 */
	getSocketData: function(id) {
		var socketData = this.io.sockets.sockets[id].store.data;
		socketData.id = id;
		return socketData;
	},
	
	/**
	 * Returns a socket object for the specified socket id
	 * @param {Socket}
	 */
	getSocket: function(id){
		return this.io.sockets.sockets[id];
	}
});