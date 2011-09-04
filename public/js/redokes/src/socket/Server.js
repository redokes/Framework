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

function getSocketData(id) {
	var socketData = io.sockets.sockets[id].store.data;
	socketData.id = id;
	return socketData;
}

function initListeners(namespace) {
	console.log('Init listeners for ' + namespace.name);
	namespace.on('connection', function(socket) {
		console.log('Connected to namespace ' + socket.namespace.name);
		
		socket.on('makeNamespace', function(params, callback) {
			makeNamespace(params.name);
			callback({
				name:params.name
			});
		});
		
		socket.on('setData', function(params, callback) {
			console.log('set data');
//			console.log(params);
			for (var i in params) {
				socket.set(i, params[i]);
			}
			socket.broadcast.emit('setData', getSocketData(socket.id));
		});
		
		// Send the user data about other users
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
		
		// Broadcast the connection
		socket.broadcast.emit('otherConnect', getSocketData[socket.id]);
			
		// When the server gets a message, during a connection, broadcast the message
		socket.on('message', function(request){
//			console.log(socket.namespace.name + ' ' + 'Message from ' + socket.id);
//			console.log(request);
			request.storeData = getSocketData(socket.id);
			socket.broadcast.emit(request.action, request);
		});

		// When a user disconnects, broadcast the disconnection to other users
		socket.on('disconnect', function(request) {
			console.log('Disconnect from ' + socket.namespace.name);
			socket.broadcast.emit('otherDisconnect', socket.id);
		});
		
	});
}

makeNamespace('');