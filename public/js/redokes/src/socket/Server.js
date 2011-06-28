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

var http = require('http'), // HTTP server
  io = require('socket.io'), // Socket.io
  fs = require('fs'); // File System
  qs = require('querystring'); // Query String
  utils = require('util');
 
// make a standard server
server = http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    // read index.html and send it to the client
    //var output = fs.readFileSync('./index.php', 'utf8');
	res.end('nodejs');
});

//Parse the requests to this server
server.addListener('request', function(request, response){
	var requestObject = require('url').parse(request.url, true);
	var path = requestObject.pathname.replace(/^\//, "").replace(/\/$/, "");
	
	//Handle the post params
	if (request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var post = qs.parse(body.replace( /\+/g, ' ' ));
			parseRequest(path, post);
        });
    }
	else{
		parseRequest(path, {});
	}
});

// run on port 8080
server.listen(8080);

//Clients array
var clients = {};
var keyLookupTable = {};
 
// listen to the server
var socket = io.listen(server);

// on a connection, do stuff
socket.on('connection', function(client){
	send(
		client,
		Modules.Server,
		Actions.Init,
		{
			clients: clients
		}
	);
	
	//store this client data
	clients[client.sessionId] = {
		sessionId: client.sessionId,
		data: {}
	};
	
    // broadcast the connection
	broadcast(
		client,
		Modules.Client,
		Actions.Connect,
		clients[client.sessionId]
	);
    
	// when the server gets a message, during a connection, broadcast the message
	client.on('message', function(request){
		
		//The only thing that the server is really worried about is the server and client module calls
		var module = request.module;
		var action = request.action;
		
		//Switch on the module
		switch(module){
			case Modules.Client:
				//Update the clients data
				if(action == Actions.Update){
					var oldData = clients[client.sessionId].data;
					var newData = request.data;
					var key, value;
					
					//Loop through the keys and add to the lookup table
					if(newData.keys != null){
						for(key in newData.keys){
							//get the value
							value = request.data.keys[key];
							
							//Check if this key exists
							if(keyLookupTable[key] == null){
								keyLookupTable[key] = {};
							}
							
							//check if this value exists
							if(keyLookupTable[key][value] == null){
								keyLookupTable[key][value] = {};
							}
							
							//Add this client to key value
							keyLookupTable[key][value][client.sessionId] = true;
						}
					}
					
					//Clean up any old keys
					if(oldData.keys != null){
						for(key in oldData.keys){
							if(newData.keys[key] == null || oldData.keys[key] != newData.keys[key]){
								//get the value
								value = request.data.keys[key];
								if(keyLookupTable[key] != null && keyLookupTable[key][value] != null && keyLookupTable[key][value][client.sessionId] != null){
									delete keyLookupTable[key][value][client.sessionId];
								}
							}
						}
					}
				}
			break;

			default:
			break;
		}
		
		//Broadcast the message
		broadcast(
			client,
			request.module,
			request.action,
			request.data
		);
	});
    
	// when the server gets a disconnect, during a connection, broadcast the disconnection
	client.on('disconnect', function(){ 
		//Broadcast the disconnect message
		broadcast(
			client,
			Modules.Client,
			Actions.Disconnect,
			{}
		);
		
		//Remove from client list
		delete clients[client.sessionId];
	});
});

socket.on('disconnect', function(client){
	 //Cleanup the keylookups
	var data = clients[client.sessionId].data;
	for(var key in data){
		//get the value
		var value = data.keys[key];
		if(keyLookupTable[key] != null && keyLookupTable[key][value] != null && keyLookupTable[key][value][client.sessionId] != null){
			delete keyLookupTable[key][value][client.sessionId];
		}
	}
});


function send(client, module, action, data){
	client.send({
		module: module,
		action: action,
		session: client.sessionId,
		data: data
	});
}

function broadcast(client, module, action, data){
	client.broadcast({
		module: module,
		action: action,
		session: client.sessionId,
		data: data
	});
}

function parseRequest(path, post){
	var requestArray = path.split('/');
	if(requestArray.length < 3){
		return false;
	}
	var type = requestArray[0];
	var module = requestArray[1];
	var action = requestArray[2];
	var data = {};
	if(post.data != null){
		post.data = JSON.parse(post.data);
		data = post.data;
	}
	
	//Switch on the type
	switch(type){
		case "broadcast":
			socketBroadcast(module, action, data);
		break;
		
		case "send":
			socketSend(module, action, post);
		break;

		default:
		break;
	}
	
	return true;
	
}

function socketBroadcast(module, action, data){
	socket.broadcast({
		module: module,
		action: action,
		data: data
	});
}

function socketSend(module, action, post){
	//Look for the keys object
	if(post.keys == null){
		return false;
	}
	
	//Loop over the keys to try to find any matching items
	var keys = JSON.parse(post.keys);
	var sessionIds = [];
	var i, key, value, values, sessionId, client;
	for(key in keys){
		value = keys[key];
		values = [];
		if(typeof value != 'array' || typeof value != 'object'){
			values.push(value);
		}
		else{
			values = value;
		}
		console.log(values);
		
		for(i = 0; i < values.length; i++){
			value = values[i];
			if(keyLookupTable[key] != null && keyLookupTable[key][value] != null){
				for(sessionId in keyLookupTable[key][value]){
					sessionIds.push(sessionId);
				}
			}
		}
	}
	
	//Loop through any found clients and send a message
	for(i = 0; i < sessionIds.length; i++){
		sessionId = sessionIds[i];
		if(socket.clients[sessionId] != null){
			client = socket.clients[sessionId];
			send(client, module, action, post.data);
		}
	}
	return true;
}