Ext.define('Redokes.map.MapData', {
	extend:'Ext.util.Observable',
	
	title:false,
	spawnPoint:{0:0, 1:0, x:0, y:0, layer:0},
	tileSheet:false,
	numLayers:0,
	width:0,
	height:0,
	objectLayers:[],
	spawnX:0,
	spawnY:0,
	spawnLayer:0,
	tileData:[],
	tiles:[],
	tileSize:0,
	music:'/modules/wes/town1.mp3',
	
	socket:false,
	players:false,
	numPlayers:0,

	constructor: function(config) {
		d('MapData constructor');
		config = config || {};
		Ext.apply(this, config);
		this.tiles = [];
		this.players = {
			0:this.game.player
		};
		this.setSpawnPoint(this.spawnX, this.spawnY, this.spawnLayer);
		this.numLayers = this.tileData.length;
		if (this.numLayers) {
			this.width = this.tileData[0][0].length;
			this.height = this.tileData[0].length;
			
			// build tile array for quicker access to data in loop
			for (var layerIndex = 0; layerIndex < this.numLayers; layerIndex++) {
				// add layer
				this.tiles.push([]);
				for (var i = 0; i < this.height; i++) {
					// add row
					this.tiles[layerIndex].push([]);
					for (var j = 0; j < this.width; j++) {
						var tile = this.tileData[layerIndex][i][j];
						var extraTileData = {
							xOffset:tile.tileIndex * this.tileSize
						};
						Ext.apply(this.tileData[layerIndex][i][j], extraTileData);
						
						// add tile
						this.tiles[layerIndex][i].push(tile.tileIndex);
					}
				}
			}
		}
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
			
			client.socket.emit('getSocketIds', {}, Ext.Function.bind(function(params) {
				this.initRemotePlayers(params.socketIds);
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

				client.socket.on('player.move', Ext.Function.bind(function(request) {
//					console.log('player move');
					if (!this.players[request.id]) {
						this.initRemotePlayer(request.id);
					}
					this.players[request.id].updateRemotePlayer(request.data);
				}, this));
				
				client.socket.on('player.joinmap', Ext.Function.bind(function(request) {
//					console.log('player join map');
					this.initRemotePlayer(request.id);
					this.game.player.socketMovePlayer(this.game.player.currentAnimation.title);
				}, this));
				
				client.socket.on('player.leavemap', Ext.Function.bind(function(request) {
//					console.log('player leave map');
					this.removeRemotePlayer(request.id);
				}, this));
				
				client.socket.on('chat.send', Ext.Function.bind(function(request) {
					this.game.chatPanel.receiveChat(client.namespace, request.id, request.data.text);
				}, this));
				
			}, this));
		}, this);
	},
	
	initRemotePlayer: function(socketId) {
		d('Init remote player ' + socketId);
		this.addRemotePlayer(socketId);
	},
	
	initRemotePlayers: function(socketIds) {
		d('Init remote players');
		var numSocketIds = socketIds.length;
		for (var i = 0; i < numSocketIds; i++) {
			this.addRemotePlayer(socketIds[i]);
		}
	},
	
	addRemotePlayer: function(socketId) {
		d('Add remote player ' + socketId);
		if (!this.players[socketId]) {
			var remotePlayer = Ext.create('Redokes.sprite.PlayerUser', {
				img:'/modules/wes/img/sprite/player/mog.png',
				width:32,
				height:44,
				x:0,
				y:0,
				game:this.game,
				context:this.game.context
			});
			this.players[socketId] = remotePlayer;
		}
	},
	
	removeRemotePlayer: function(socketId) {
		d('Remove remote player ' + socketId);
		delete this.players[socketId];
	},
	
	updateRemotePlayer: function(socketId) {
		d('Update remote player ' + socketId);
		
	}
	
});