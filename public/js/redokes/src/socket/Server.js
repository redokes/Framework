var httpServer = {
	
	/**
     * Load all the required classes for the server
     */
	http: require('http'),
	fs: require('fs'),
	qs: require('querystring'),
	utils: require('util'),
	
	init: function() {
		this.initHttpServer();
	},
	
	initHttpServer: function() {
		this.httpServer = this.http.createServer(function(req, res){
			res.writeHead(200, {'Content-Type': 'text/html'});
			// read index.html and send it to the client
			//var output = fs.readFileSync('./index.php', 'utf8');
			res.end('nodejs');
		});
		this.httpServer.listen(8080);
	},
	
	initSocketServer: function() {
		
	}
};

var socketServer = {
	socketio: require('socket.io'),
	io:false,
	
	/**
	 * Init socket io by telling it the http server
	 */
	init: function(httpServer) {
		this.io = this.socketio.listen(httpServer);
		this.io.set('log level', 1);
		this.createNamespace('');
	},
	
	/**
	 * Creates a new namespace if it doesn't already exist
	 * @param {String} name
	 */
	createNamespace: function(name) {
		if (!this.io.sockets.manager.namespaces['/' + name]) {
			console.log('Making namespace ' + name);
			if (name.length) {
				this.initNamespace(this.io.of('/' + name));
			}
			else {
				this.initNamespace(this.io.sockets);
			}
		}
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
	 * Sets up all of the listeners for a namespace when it is created. This
	 * includes the main global namespace
	 * @param {Namespace} namespace
	 */
	initNamespace: function(namespace) {
		console.log('Init namespace ' + namespace.name);
		this.initNamespaceListeners(namespace);
	},
	
	initNamespaceListeners: function(namespace) {

		/**
		 * All socket listeners will be set once the namespace has been connected to
		 */
		namespace.on('connection', function(socket) {
			console.log('Connected to namespace ' + socket.namespace.name);

			/**
			 * Init all socket listeners
			 */
			this.initSocketListeners(socket);

			/**
			 * Let all other users know this user has connected to the namespace
			 * Send the socket's data store as a parameter
			 */
			socket.broadcast.emit('otherConnect', this.getSocketData[socket.id]);

		}.bind(this));
	},
	
	initSocketListeners: function(socket) {
		
		/**
		 * Ensures that a namespace exists when a user tries to connect to it
		 */
		socket.on('makeNamespace', function(params, callback) {
			this.createNamespace(params.name);
			callback({
				name:params.name
			});
		}.bind(this));

		/**
		 * Set any passed data in the user's data store
		 */
		socket.on('setData', function(params, callback) {
			console.log('set data');
//			console.log(params);
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

			callback({
				socketIds:socketIds
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

			callback({
				sockets:socketArray
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
			console.log(socket.namespace.name + ' ' + 'Message from ' + socket.id);
			console.log(request);
			request.storeData = this.getSocketData(socket.id);
			
			/**
			 * Check if this is a message for one person or if it needs to be broadcasted
			 */
			if (request.socketId) {
				if (request.module == null) {
					this.io.sockets.sockets[request.socketId].emit(request.action, request);
				}
				else {
					this.io.sockets.sockets[request.socketId].emit('message', request);
				}
			}
			else {
				if (request.module == null) {
					socket.broadcast.emit(request.action, request);
				}
				else {
					socket.broadcast.emit('message', request);
				}
			}
		}.bind(this));

		/**
		 * When a user disconnects, broadcast the disconnection to other users
		 * Fire the otherDisconnect event to all other users in this namespace
		 */
		socket.on('disconnect', function(request) {
			console.log('Disconnect from ' + socket.namespace.name);
			socket.broadcast.emit('otherDisconnect', socket.id);
		}.bind(this));
	}

	
};

httpServer.init();
socketServer.init(httpServer.httpServer);