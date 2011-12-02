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

			/**
			 * Init all socket listeners
			 */
			this.initSocketListeners(socket);

			/**
			 * Let all other users know this user has connected to the namespace
			 * Emit the userConnect event
			 * Send the socket's data store as a parameter
			 */
			socket.broadcast.emit('otherConnect', this.getSocketData(socket.id));
			socket.broadcast.emit('userConnect', this.getSocketData(socket.id));

		}.bind(this));
	},
	
	initSocketListeners: function(socket) {
		
		/**
		 * Ensures that a namespace exists when a user tries to connect to it
		 */
		socket.on('makeNamespace', function(params, callback) {
			this.log('Create namespace ' + params.name);
			this.socket.createNamespace(params.name);
			callback({
				name: params.name
			});
		}.bind(this));

		/**
		 * Set any passed data in the user's data store
		 */
		socket.on('setData', function(params, callback) {
			this.log('Set data');
//			this.log(params);
			for (var i in params) {
				socket.set(i, params[i]);
			}
			socket.broadcast.emit('setData', this.getSocketData(socket.id));
		}.bind(this));

		/**
		 * Sends an object containing an array of socket ids
		 * for all users connected to the current namespace
		 * to the callback function
		 */
		socket.on('getSocketIds', function(params, callback) {
			var namespace = socket.namespace.name;
			var sockets = socket.manager.rooms[namespace];
			var numSockets = sockets.length;
			var socketIds = [];
			var mySocketId = socket.id;
			for (var i = 0; i < numSockets; i++) {
				if (sockets[i] != mySocketId) {
					socketIds.push(sockets[i]);
				}
			}
			
			// Call the callback function and send the array of socket ids
			callback({
				socketIds: socketIds
			});
		}.bind(this));

		/**
		 * Sends an object containing an array of socket data stores
		 * for all users connected to the current namespace
		 * to the callback function
		 */
		socket.on('getRemoteUsers', function(params, callback) {
			var namespace = socket.namespace.name;
			var sockets = socket.manager.rooms[namespace];
			var numSockets = sockets.length;
			var socketArray = [];
			var mySocketId = socket.id;
			for (var i = 0; i < numSockets; i++) {
				if (sockets[i] != mySocketId) {
					socketArray.push(this.getSocketData(sockets[i]));
				}
			}
			
			// Call the callback function and send the array of user data
			callback({
				sockets: socketArray
			});
		}.bind(this));

		/**
		 * Fire an event on all other users as defined by request.action
		 * If the client is using the module/action communication method, the "message" event
		 * will always be fired so the module and action data can be handled by
		 * a message handler on the client side
		 * Adds the socket's store data to the response
		 */
		socket.on('message', function(request){
			this.emitRequest(request, socket);
		}.bind(this));

		/**
		 * When a user disconnects, broadcast the disconnection to other users
		 * Fire the userDisconnect event to all other users in this namespace
		 */
		socket.on('disconnect', function(request) {
			this.log('Disconnect from ' + socket.namespace.name);
			socket.broadcast.emit('otherDisconnect', socket.id);
			socket.broadcast.emit('userDisconnect', socket.id);
		}.bind(this));
	},
	
	emitRequest: function(request, socket) {
		
		// Get the store data of the socket
		request.storeData = this.getSocketData(socket.id);

		// Fire the before message event
		if (this.fireEvent('beforemessage', this, request, socket) === false) {
			return;
		}

		// Emit the message
		// Check if this message is for one user (not broadcast)
		if (request.data && request.data.socketId) {
			
			// Check if using the emit event implementation or module approach
			if (request.module == null) {
				
				// Using the emit implementation
				this.io.sockets.sockets[request.data.socketId].emit(request.action, request);
			}
			else {
				
				// Make sure this user still exists in the socket array
				if (this.io.sockets.sockets[request.data.socketId] != null) {
					
					// Use the module-based implementation
					this.io.sockets.sockets[request.data.socketId].emit('message', request);
				}
			}
		}
		else {
			// This is a broadcast message
			// Check if using the emit event implementation or module approach
			if (request.module == null) {
				socket.broadcast.emit(request.action, request);
			}
			else {
				// Use the module-based implementation
				socket.broadcast.emit('message', request);
			}
		}

		//Fire  the message event
		this.fireEvent('message', this, request, socket);
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