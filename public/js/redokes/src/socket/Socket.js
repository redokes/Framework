Ext.define('Redokes.socket.Socket', {
	extend: 'Ext.util.Observable',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	config:{
		socket: null,
		namespace: null
	},
	
	constructor: function(config) {
        this.initConfig(config);
		this.initListeners();
		this.emitConnection();
    },
	
	initListeners: function() {
		this.socket.on('connectToNamespace', this.onConnectToNamespace.bind(this));
		this.socket.on('makeNamespace', function(params, callback) {
			console.log('makeNamespace is depricated. Use connectToNamespace');
			this.onConnectToNamespace(params, callback);
		}.bind(this));
		this.socket.on('setData', this.onSetData.bind(this));
		this.socket.on('getSocketIds', this.onGetSocketIds.bind(this));
		this.socket.on('getRemoteUsers', this.onGetRemoteUsers.bind(this));
		this.socket.on('message', this.onMessage.bind(this));
		this.socket.on('disconnect', this.onDisconnect.bind(this));
	},
	
	emitConnection: function() {
		/**
		 * Let all other users know this user has connected to the namespace
		 * Emit the userConnect event
		 * Send the socket's data store as a parameter
		 */
		this.socket.broadcast.emit('otherConnect', this.namespace.getSocketData(this.socket.id));
		this.socket.broadcast.emit('userConnect', this.namespace.getSocketData(this.socket.id));
	},
	
	/**
	 * Ensures that a namespace exists when a user tries to connect to it
	 */
	onConnectToNamespace: function(params, callback) {
		this.log('Connect to namespace ' + params.name);
		this.socket.createNamespace(params.name);
		callback({
			name: params.name
		});
	},
	
	/**
	 * Set any passed data in the user's data store
	 */
	onSetData: function(params, callback) {
		this.log('Set data');
//			this.log(params);
		for (var i in params) {
			this.socket.set(i, params[i]);
		}
		this.socket.broadcast.emit('setData', this.namespace.getSocketData(this.socket.id));
	},
	
	/**
	 * Sends an object containing an array of socket ids
	 * for all users connected to the current namespace
	 * to the callback function
	 */
	onGetSocketIds: function(params, callback) {
		var namespace = this.socket.namespace.name;
		var sockets = this.socket.manager.rooms[namespace];
		var numSockets = sockets.length;
		var socketIds = [];
		var mySocketId = this.socket.id;
		for (var i = 0; i < numSockets; i++) {
			if (sockets[i] != mySocketId) {
				socketIds.push(sockets[i]);
			}
		}

		// Call the callback function and send the array of socket ids
		callback({
			socketIds: socketIds
		});
	},
	
	/**
	 * Sends an object containing an array of socket data stores
	 * for all users connected to the current namespace
	 * to the callback function
	 */
	onGetRemoteUsers: function(params, callback) {
		var namespace = this.socket.namespace.name;
		var sockets = this.socket.manager.rooms[namespace];
		var numSockets = sockets.length;
		var socketArray = [];
		var mySocketId = this.socket.id;
		for (var i = 0; i < numSockets; i++) {
			if (sockets[i] != mySocketId) {
				socketArray.push(this.getSocketData(sockets[i]));
			}
		}

		// Call the callback function and send the array of user data
		callback({
			sockets: socketArray
		});
	},
	
	/**
	 * Fire an event on all other users as defined by request.action
	 * If the client is using the module/action communication method, the "message" event
	 * will always be fired so the module and action data can be handled by
	 * a message handler on the client side
	 * Adds the socket's store data to the response
	 */
	onMessage: function(request) {
		// Get the store data of the socket
		request.storeData = this.getSocketData(this.socket.id);

		// Fire the before message event
		if (this.fireEvent('beforemessage', this, request, this.socket) === false) {
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
				this.socket.broadcast.emit(request.action, request);
			}
			else {
				// Use the module-based implementation
				this.socket.broadcast.emit('message', request);
			}
		}

		// Fire the message event
		this.fireEvent('message', this, request, this.socket);
	},
	
	/**
	 * When a user disconnects, broadcast the disconnection to other users
	 * Fire the userDisconnect event to all other users in this namespace
	 */
	onDisconnect: function(request) {
		this.log('Disconnect from ' + this.socket.namespace.name);
		this.socket.broadcast.emit('otherDisconnect', this.socket.id);
		this.socket.broadcast.emit('userDisconnect', this.socket.id);
	}
	
});