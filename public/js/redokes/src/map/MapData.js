Ext.define('Redokes.map.MapData', {
	extend:'Ext.util.Observable',
	
	title:false,
	fileName:false,
	spawnPoint:{0:0, 1:0, x:0, y:0, layer:0},
	tileSheet:false,
	numLayers:0,
	width:0,
	height:0,
	objectLayers:[],
	
	spawnX:0,
	spawnY:0,
	spawnLayer:0,
	
	tileData:false,
	tileSize:0,
	
	music:'/modules/wes/town1.mp3',
	
	socket:false,
	players:false,
	numPlayers:0,
	
	valueFields:['title', 'fileName', 'tileSheet', 'numLayers', 'width', 'height', 'spawnX', 'spawnY', 'spawnLayer', 'music', 'tileSize', 'tileData'],

	constructor: function(config) {
		d('MapData constructor');
		Ext.apply(this, config);
		this.players = {
			0:this.game.player
		};
		if (!this.tileData) {
			// Need to init default empty tile data
			this.tileData = [];
			for (var layerIndex = 0; layerIndex < this.numLayers; layerIndex++) {
				this.tileData.push([]);
				for (var rowIndex = 0; rowIndex < this.height; rowIndex++) {
					this.tileData[layerIndex].push([]);
					for (var columnIndex = 0; columnIndex < this.width; columnIndex++) {
						this.tileData[layerIndex][rowIndex].push({
							tileIndex:false,
							isWall:false
						});
					}
				}
			}
		}
	},
	
	getValues: function() {
		var numValues = this.valueFields.length;
		var returnValues = {};
		for (var i = 0; i < numValues; i++) {
			returnValues[this.valueFields[i]] = this[this.valueFields[i]];
		}
		return returnValues;
	},

	setSpawnPoint: function(x, y, layer) {
		layer = layer || 0;
		
		if (x < 0) {
			this.spawnX = this.tileData[0][0].length + x;
		}
		else {
			this.spawnX = x;
		}
		if (y < 0) {
			this.spawnY = this.tileData[0].length + y;
		}
		else {
			this.spawnY = y;
		}
		this.spawnLayer = layer;
	},
	
	initMapSocket: function() {
		d('Init map socket');
		if (this.socket) {
			this.socket.send('player.joinmap');
		}
		else {
			this.game.socketManager.on('initclient', this.onInitMapSocketClient, this, {single:true});
			this.game.socketManager.createNamespace(this.title);
		}
		
	},
	
	onInitMapSocketClient: function(client) {
		this.socket = client;
		
		d('Made map socket client ' + client.namespace);
		client.on('connect', function(client, args) {
			d('Socket connect');
			
			client.socket.emit('getRemoteUsers', {}, Ext.bind(function(params) {
//				console.log('get remote users');
//				console.log(params.sockets);
				this.initRemotePlayers(params.sockets);
				
				client.send('player.joinmap');
				
				this.game.player.socketMovePlayer(this.game.player.currentAnimation.title);
				
				client.on('disconnect', function(client, args) {
//					console.log('Socket disconnect');

				}, this);
				client.on('otherConnect', function(client, args) {
//					console.log('Other connect');
//					this.initRemotePlayer(args[0]);
				}, this);
				client.on('otherDisconnect', function(client, args) {
					this.removeRemotePlayer(args[0]);
				}, this);

				client.socket.on('player.move', Ext.bind(function(request) {
					if (!this.players[request.storeData.id]) {
						this.initRemotePlayer(request.storeData);
					}
					this.players[request.storeData.id].updateRemotePlayer(request.data);
				}, this));
				
				client.socket.on('setData', Ext.bind(function(data) {
					if (this.players[data.id] && this.players[data.id].img != data.img) {
						this.players[data.id].loadImage(data.img);
					}
				}, this));
				
				client.socket.on('player.joinmap', Ext.bind(function(request) {
//					console.log('player join map');
					this.initRemotePlayer(request.storeData);
					this.game.player.socketMovePlayer(this.game.player.currentAnimation.title);
				}, this));
				
				client.socket.on('player.leavemap', Ext.bind(function(request) {
//					console.log('player leave map');
					this.removeRemotePlayer(request);
				}, this));
				
				client.socket.on('chat.send', Ext.bind(function(request) {
					this.game.receiveChat(client.namespace, request);
				}, this));
				
			}, this));
		}, this);
	},
	
	initRemotePlayer: function(data) {
//		console.log('Init remote player ' + data.id);
//		console.log(data);
		this.addRemotePlayer(data);
	},
	
	initRemotePlayers: function(sockets) {
//		console.log('Init remote players');
//		console.log(sockets);
		var numSockets = sockets.length;
		for (var i = 0; i < numSockets; i++) {
			this.addRemotePlayer(sockets[i]);
		}
	},
	
	addRemotePlayer: function(data) {
//		console.log('Add remote player ' + data.id);
//		console.log(data);
		if (!this.players[data.id]) {
			var remotePlayer = Ext.create('Redokes.sprite.PlayerUser', {
				img:data.img,
				width:32,
				height:44,
				x:0,
				y:0,
				game:this.game,
				context:this.game.context
			});
			this.players[data.id] = remotePlayer;
		}
	},
	
	removeRemotePlayer: function(socketId) {
//		console.log('Remove remote player ' + socketId);
		delete this.players[socketId];
	},
	
	updateRemotePlayer: function(socketId) {
		d('Update remote player ' + socketId);
		
	}
	
});