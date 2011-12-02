Ext.define('Redokes.map.Map', {
	extend: 'Ext.util.Observable',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	game: null,
	mapName: null,
	
	loadedSprites: {},
	players: {},
	
	spawnPoint:{0:0, 1:0, x:0, y:0, layer:0},
	tileSheet:false,
	numLayers:0,
	width: 0,
	height: 0,
	objectLayers:[],
	spawnX: 0,
	spawnY: 0,
	spawnLayer: 0,
	tileSize: 0,
	music: '/modules/wes/town1.mp3',
	socket: false,
	players: false,
	numPlayers: 0,
	
	translateX: 0,
	translateY: 0,
	following: false,
	loadMapCoords: false,
	
	constructor: function(params) {
		this.showLog();
		this.log('Map constructor');
		
		this.loadedSprites = {};
		this.players = {};
		
		Ext.apply(this, params);
		
		this.context = this.game.context;
		this.tileSize = this.game.tileSize;
		this.addEvents('mapload');
		
		this.init();
	},
	
	init: function() {
		this.initMapData();
		this.initListeners();
		this.loadResources();
	},
	
	initMapData: function() {
		this.players = {
			0: this.game.player
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
	
	initListeners: function() {
		this.on('mapload', function() {
			this.log('map load');
			
			// Tell the map to follow this user
			this.follow(this.game.player);
			
			// Move the player to the spawn point of the current map
			if (this.loadMapCoords) {
				this.game.player.setToTile(this.loadMapCoords.x, this.loadMapCoords.y, this.loadMapCoords.layer, this.game.tileSize);
				this.loadMapCoords = false;
			}
			else {
				this.game.player.setToTile(this.spawnX, this.spawnY, this.spawnLayer, this.game.tileSize);
			}
			
			this.game.player.setPlayerData({
				layer:this.game.player.layer
			});
			this.game.player.socketSendPlayerData();
//			console.log('set player data ' + this.game.player.layer);

			// Set up the map socket
			if (this.game.hasSocket) {
				this.initMapSocket();
			}
			
		}, this);
		
	},
	
	loadResources: function() {
		this.log('Map.loadResources ' + this.title);
		
		if (!this.title.length) {
			return;
		}
		
		// Check if this sprite sheet has been loaded
		if (this.loadedSprites[this.tileSheet]) {
			this.process();
		}
		else {
			// Load map resources
			var img = Ext.get(new Image());
			img.on('load', function() {
				this.process();
			}, this);
			img.dom.src = this.tileSheet;

			// Set the sprite sheet as loaded
			this.loadedSprites[this.tileSheet] = img.dom;
		}
	},

	process: function() {
		this.log('Process Map ' + this.title);
		
		// Set the current sprite sheet
		this.currentImage = this.loadedSprites[this.tileSheet];
		
		// Make sure this map has data
		if (this.numLayers) {
			this.log('Map has ' + this.numLayers + ' layer');
			// Calculate the bounds for the map
			this.maxTranslateX = 0 - (this.width * this.tileSize) + this.game.canvas.dom.width;
			this.maxTranslateY = 0 - (this.height * this.tileSize) + this.game.canvas.dom.height;
			this.halfMapWidth = this.game.canvas.dom.width / 2;
			this.halfMapHeight = this.game.canvas.dom.height / 2;
		}
		this.fireEvent('mapload');
	},

	follow: function(sprite) {
		this.halfPlayerWidth = sprite.width / 2;
		this.halfPlayerHeight = sprite.height / 2;
		this.following = sprite;
	},

	draw: function() {
		var player = this.following;
		
		// center player by shifting context
		this.translateX = this.halfMapWidth - player.x - this.halfPlayerWidth;
		this.translateY = this.halfMapHeight - player.y - this.halfPlayerHeight;
		if (this.translateX > 0) {
			this.translateX = 0;
		}
		else if (this.translateX < this.maxTranslateX) {
			this.translateX = this.maxTranslateX;
		}
		if (this.translateY > 0) {
			this.translateY = 0;
		}
		else if (this.translateY < this.maxTranslateY) {
			this.translateY = this.maxTranslateY;
		}
		
		var numLayers = this.numLayers;

		// find out where to start the x,y loop
		var startX = Math.floor((this.translateX * -1) / this.tileSize);
		var stopX = startX + this.game.numTilesWidth + 1;
		var startY = Math.floor((this.translateY * -1) / this.tileSize);
		var stopY = startY + this.game.numTilesHeight + 1;
		
		if (stopY > this.height) {
			stopY = this.height;
		}
		if (stopX > this.width) {
			stopX = this.width;
		}
		
		for (var layerIndex = 0; layerIndex < numLayers; layerIndex++) {
			// translate canvas based on player position
			this.context.save();
			this.context.translate(this.translateX, this.translateY);

			// draw the layer's tiles and objects
			for (var i = startY; i < stopY; i++) {
				for (var j = startX; j < stopX; j++) {
					// draw tile
					var tile = this.tileData[layerIndex][i][j];
					if (tile.tileIndex !== false) {
						this.context.drawImage(this.currentImage, tile.tileIndex * this.tileSize, 0, this.tileSize, this.tileSize, j*this.tileSize, i*this.tileSize, this.tileSize, this.tileSize);
					}
					
					// draw object
					
				}
			}
			
			// draw the players on this layer
			for (var i in this.players) {
				// draw player sprite
				var remotePlayer = this.players[i];
				if (remotePlayer.layer == layerIndex) {
					if (i != 0) {
						remotePlayer.moveRemotePlayer();
					}
					remotePlayer.draw();
				}
			}
			
//			// draw player
//			if (player.layer == layerIndex) {
//				player.draw();
//			}
			this.context.restore();
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
		this.log('Init map socket');
		if (this.socket) {
			this.socket.send('player.joinmap');
		}
		else {
			this.log('No map socket so no join map');
			this.game.socketManager.on('initclient', this.onInitMapSocketClient, this, {single:true});
			this.game.socketManager.createNamespace(this.title);
		}
		
	},
	
	onInitMapSocketClient: function(client) {
		this.socket = client;
		
		this.log('Made map socket client ' + client.namespace);
		client.on('connect', function(client, args) {
			this.log('Socket connect');
			
			client.socket.emit('getRemoteUsers', {}, Ext.bind(function(params) {
				this.log('get remote users');
//				this.log(params);
				this.initRemotePlayers(params.sockets);
				
				client.send('player.joinmap');
				
				this.game.player.socketMovePlayer(this.game.player.currentAnimation.title);
				
				client.on('disconnect', function(client, args) {
					this.log('Socket disconnect');
				}, this);
				client.on('otherConnect', function(client, args) {
					this.log('other connect');
//					console.log('Other connect');
//					this.initRemotePlayer(args[0]);
				}, this);
				client.on('otherDisconnect', function(client, args) {
					this.log('Other disconnect')
					this.removeRemotePlayer({
						id:args[0]
					});
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
					this.log('player join map');
					this.log(request.storeData);
					this.initRemotePlayer(request.storeData);
					this.game.player.socketMovePlayer(this.game.player.currentAnimation.title);
				}, this));
				
				client.socket.on('player.leavemap', Ext.bind(function(request) {
//					console.log('player leave map');
					this.removeRemotePlayer(request.storeData);
				}, this));
				
				client.socket.on('chat.send', Ext.bind(function(request) {
					this.game.receiveChat(client.namespace, request);
				}, this));
				
			}, this));
		}, this);
	},
	
	initRemotePlayer: function(data) {
		this.log('Init remote player ' + data.id);
		this.log(data);
		this.addRemotePlayer(data);
	},
	
	initRemotePlayers: function(sockets) {
		this.log('Init remote players');
		this.log(sockets);
		var numSockets = sockets.length;
		for (var i = 0; i < numSockets; i++) {
			this.addRemotePlayer(sockets[i]);
		}
	},
	
	addRemotePlayer: function(data) {
		this.log('Add remote player ' + data.id);
		this.log(data);
		if (!this.players[data.id]) {
			this.log('Making remote player');
			var remotePlayer = Ext.create('Redokes.sprite.PlayerUser', {
				img:data.img,
				width:32,
				height:44,
				x:0,
				y:0,
				layer:data.layer,
				game:this.game,
				context:this.game.context
			});
			this.players[data.id] = remotePlayer;
		}
		else {
			this.log('Not making remote player');
		}
	},
	
	removeRemotePlayer: function(data) {
		this.log('Remove remote player ' + data.id);
		delete this.players[data.id];
	},
	
	updateRemotePlayer: function(socketId) {
		this.log('Update remote player ' + socketId);
		
	}
	
});