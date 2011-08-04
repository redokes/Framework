/**
 * Types of requests - modules
 * 	-client
 * 		-update
 * 		-connect
 * 		-disconnect
 * 	-server
 * 		-update
 * 		-init
 */
var Modules = {
	Server: "server",
	Client: "client"
};

var Actions = {
	Init: "init",
	Connect: "connect",
	Disconnect: "disconnect",
	Update: "update"
};

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

function makeNamespace(name) {
	if (!io.sockets.manager.namespaces['/' + name]) {
		console.log('making namespace ' + name);
		if (name.length) {
			initListeners(io.of('/' + name));
		}
		else {
			initListeners(io.sockets);
		}
	}
}

function initListeners(namespace) {
	namespace.on('connection', function(socket) {
		console.log('connected to new namespace');
		
		socket.on('makeNamespace', function(params, callback) {
			makeNamespace(params.name);
			callback({
				name:params.name
			});
		});
		
		socket.on('setData', function(params, callback) {
			for (var i in params) {
				socket.set(i, params[i]);
			}
		});
		
		// Broadcast the connection
		socket.json.send({
			test:'testing'
		});
		socket.broadcast.emit('otherConnect', socket.id);
			
		// When the server gets a message, during a connection, broadcast the message
		socket.on('message', function(request){
			socket.broadcast.emit(request.action, request.data);
		});

		// when the server gets a disconnect, during a connection, broadcast the disconnection
		socket.on('disconnect', function(request) {
			socket.broadcast.emit('otherDisconnect');
		});
		
	});
}

makeNamespace('');