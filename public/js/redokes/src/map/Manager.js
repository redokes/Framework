Ext.define('Redokes.map.Manager', {
	extend: 'Ext.util.Observable',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	loadedMaps: {},
	currentMap: false,
	forceLoad: false,
	game: false,
	
	constructor: function(params) {
		this.log('Constructor');
		this.loadedMaps = {};
		Ext.apply(this, params);
		
		if (!this.game) {
			this.log('Map manager has no reference to game');
			return;
		}
		
		this.addEvents('mapload');
		this.init();
	},
	
	init: function() {
		this.initListeners();
	},
	
	initListeners: function() {
		this.on('mapload', function() {
			// Tell the map to follow this user
			this.follow(this.game.player);
			
			// Move the player to the spawn point of the current map
			if (this.loadMapCoords) {
				this.game.player.setToTile(this.loadMapCoords.x, this.loadMapCoords.y, this.loadMapCoords.layer, this.game.tileSize);
				this.loadMapCoords = false;
			}
			else {
				this.game.player.setToTile(this.currentMap.spawnX, this.currentMap.spawnY, this.currentMap.spawnLayer, this.game.tileSize);
			}
			
			this.game.player.setPlayerData({
				layer:this.game.player.layer
			});
			this.game.player.socketSendPlayerData();
//			console.log('set player data ' + this.game.player.layer);

			// Set up the map socket
			this.currentMap.initMapSocket();
			
		}, this);
	},

	loadMap: function(mapName) {
		this.log('Load map: ' + mapName);
		
		// Make sure there is a map name
		if (!mapName.length) {
			return;
		}
		
		// Remove the player from the map socket
		if (this.currentMap) {
			this.currentMap.socket.send('player.leavemap');
		}
		
		// Check if this map has already had its resources loaded
		if (this.loadedMaps[mapName] || this.forceLoad) {
			this.processMap(mapName);
		}
		else {
			// Create the map instance
			var map = Ext.create('Redokes.map.Map', {
				mapName: mapName,
				game: this.game
			});
			
			// Listen for the map to load so we can mark it as loaded
			map.on('load', function(params) {
				// Set the map as loaded
				this.loadedMaps[mapName] = params.map;
			}, this, {map: map});
		}
	},

	processMap: function(mapName) {
		d('Process Map ' + mapName);
		// Set the current map
		this.currentMap = this.loadedMaps[mapName];
		
		// Set the current sprite sheet
		this.currentImage = this.loadedSprites[this.currentMap.tileSheet];
		
		// Make sure this map has data
		if (this.currentMap.numLayers) {
			d('Map has ' + this.currentMap.numLayers + ' layer');
			// Calculate the bounds for the map
			this.maxTranslateX = 0 - (this.currentMap.width * this.tileSize) + this.game.canvas.dom.width;
			this.maxTranslateY = 0 - (this.currentMap.height * this.tileSize) + this.game.canvas.dom.height;
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
		
		var numLayers = this.currentMap.numLayers;

		// find out where to start the x,y loop
		var startX = Math.floor((this.translateX * -1) / this.tileSize);
		var stopX = startX + this.game.numTilesWidth + 1;
		var startY = Math.floor((this.translateY * -1) / this.tileSize);
		var stopY = startY + this.game.numTilesHeight + 1;
		
		if (stopY > this.currentMap.height) {
			stopY = this.currentMap.height;
		}
		if (stopX > this.currentMap.width) {
			stopX = this.currentMap.width;
		}
		
		for (var layerIndex = 0; layerIndex < numLayers; layerIndex++) {
			// translate canvas based on player position
			this.context.save();
			this.context.translate(this.translateX, this.translateY);

			// draw the layer's tiles and objects
			for (var i = startY; i < stopY; i++) {
				for (var j = startX; j < stopX; j++) {
					// draw tile
					var tile = this.currentMap.tileData[layerIndex][i][j];
					if (tile.tileIndex !== false) {
						this.context.drawImage(this.currentImage, tile.tileIndex * this.tileSize, 0, this.tileSize, this.tileSize, j*this.tileSize, i*this.tileSize, this.tileSize, this.tileSize);
					}
					
					// draw object
					
				}
			}
			
			// draw the players on this layer
			for (var i in this.currentMap.players) {
				// draw player sprite
				var remotePlayer = this.currentMap.players[i];
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
	}
	
});