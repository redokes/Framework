var http = require('http'); // HTTP server
var io = require('socket.io'); // socket.io
var fs = require('fs'); // File System
var qs = require('querystring'); // Query String
var utils = require('util');
 
// Make a standard server
var server = http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    // read index.html and send it to the client
    //var output = fs.readFileSync('./index.php', 'utf8');
	res.end('nodejs');
});

// Run on port 8080
server.listen(8080);
io = io.listen(server);
io.set('log level', 1);

/**
 * Creates a new namespace if it doesn't already exist
 * @param {String} name
 */
function makeNamespace(name) {
	if (!io.sockets.manager.namespaces['/' + name]) {
		console.log('Making namespace ' + name);
		if (name.length) {
			initListeners(io.of('/' + name));
		}
		else {
			initListeners(io.sockets);
		}
	}
}

/**
 * Returns an object containing the store data for a given socket id
 * @param {String} id
 */
function getSocketData(id) {
	var socketData = io.sockets.sockets[id].store.data;
	socketData.id = id;
	return socketData;
}

/**
 * Sets up all of the listeners for a namespace when it is created. This
 * includes the main global namespace
 */
function initListeners(namespace) {
	console.log('Init listeners for ' + namespace.name);
	
	/**
     * All socket listeners will be set once the namespace has been connected to
     */
	namespace.on('connection', function(socket) {
		console.log('Connected to namespace ' + socket.namespace.name);
		
		/**
		 * Ensures that a namespace exists when a user tries to connect to it
		 */
		socket.on('makeNamespace', function(params, callback) {
			makeNamespace(params.name);
			callback({
				name:params.name
			});
		});
		
		/**
		 * Set any passed data in the user's data store
		 */
		socket.on('setData', function(params, callback) {
			console.log('set data');
//			console.log(params);
			for (var i in params) {
				socket.set(i, params[i]);
			}
			socket.broadcast.emit('setData', getSocketData(socket.id));
		});
		
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
		});
		
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
					socketArray.push(getSocketData(sockets[i]));
				}
			}
			
			callback({
				sockets:socketArray
			});
		});
		
		/**
		 * Let all other users know this user has connected to the namespace
		 * Send the socket's data store as a parameter
		 */
		socket.broadcast.emit('otherConnect', getSocketData[socket.id]);
			
		/**
		 * Fire an event on all other users as defined by request.action
		 * If the client is using the module/action communication method, the "message" event
		 * will always be fired so the module and action data can be handled by
		 * a message handler on the client side
		 * Adds the socket's store data to the response
		 */
		socket.on('message', function(request){
//			console.log(socket.namespace.name + ' ' + 'Message from ' + socket.id);
//			console.log(request);
			request.storeData = getSocketData(socket.id);
			if (request.module == null) {
				socket.broadcast.emit(request.action, request);
			}
			else {
				socket.broadcast.emit('message', request);
			}
		});

		/**
		 * When a user disconnects, broadcast the disconnection to other users
		 * Fire the otherDisconnect event to all other users in this namespace
		 */
		socket.on('disconnect', function(request) {
			console.log('Disconnect from ' + socket.namespace.name);
			socket.broadcast.emit('otherDisconnect', socket.id);
		});
		
	});
}

/**
 * Make the global namespace when the server is first created
 */
makeNamespace('');