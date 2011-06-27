Ext.define('Redokes.map.Map', {
	extend:Ext.util.Observable,
	
	loadedMaps:{},
	loadedSprites:{},
	currentMap:false,
	width:0,
	height:0,
	tileSize:0,
	translateX:0,
	translateY:0,
	following:false,
	
	constructor: function(game) {
		d('Map constructor');
		this.game = game;
		this.context = game.context;
		this.tileSize = game.tileSize;
		this.addEvents('mapload');
	},

	loadMap: function(mapName) {
		d('Map.loadMap ' + mapName);
		if (this.loadedMaps[mapName]) {
			this.processMap(mapName);
		}
		else {
			var map = Ext.create('Redokes.map.data.' + mapName);
			this.loadedMaps[mapName] = map;
			if (this.loadedSprites[map.tileSheet]) {
				this.processMap(mapName);
			}
			else {
				var img = Ext.get(new Image());
				img.on('load', function() {
					this.processMap(mapName);
				}, this);
				img.dom.src = map.tileSheet;
				this.loadedSprites[map.tileSheet] = img.dom;
			}
		}
	},

	processMap: function(mapName) {
		d('Process Map ' + mapName);
		this.currentMap = this.loadedMaps[mapName];
		this.currentImage = this.loadedSprites[this.currentMap.tileSheet];
		if (this.currentMap.numLayers) {
			d('Map has ' + this.currentMap.numLayers + ' layer');
			this.maxTranslateX = 0 - (this.currentMap.width * this.tileSize) + this.game.width;
			this.maxTranslateY = 0 - (this.currentMap.height * this.tileSize) + this.game.height;
			this.halfMapWidth = this.game.width / 2;
			this.halfMapHeight = this.game.height / 2;
		}
		this.fireEvent('mapload');
	},

	follow: function(sprite) {
		this.halfPlayerWidth = sprite.width / 2;
		this.halfPlayerHeight = sprite.height / 2;
		this.following = sprite;
	},

	draw: function() {
		// these draw translate variables store the translate values before the draw
		// because new values will be set during the layer loop if the player is
		// on a lower layer
		var drawTranslateX = this.translateX;
		var drawTranslateY = this.translateY;

		var numLayers = this.currentMap.numLayers;
		var numPlayers = this.game.players.length;

		// find out where to start the x,y loop
		var startX = Math.floor((drawTranslateX * -1) / this.tileSize);
		var stopX = startX + this.game.numTilesWidth + 1;
		var startY = Math.floor((drawTranslateY * -1) / this.tileSize);
		var stopY = startY + this.game.numTilesHeight + 1;
		//console.log('drawing from ' + startX + ',' + startY + ' to ' + stopX + ',' + stopY);
		
		if (stopY > this.currentMap.height) {
			stopY = this.currentMap.height;
		}
		if (stopX > this.currentMap.width) {
			stopX = this.currentMap.width;
		}
		for (var layerIndex = 0; layerIndex < numLayers; layerIndex++) {
			// translate canvas based on player position
			this.context.save();
			this.context.translate(drawTranslateX, drawTranslateY);

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
			this.context.restore();

			// draw player
			var player = this.following;
			if (player.layer == layerIndex) {
				// center player by shifting context
				this.context.save();
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

				this.context.translate(this.translateX, this.translateY);
				player.draw();
//				this.context.drawImage(player.img, player.getFrame() * player.width, 0, player.width, player.height, player.x, player.y - 28, player.width, player.height);
				this.context.restore();
			}

			// draw the players on this layer
//			for (var i = 0; i < numPlayers; i++) {
//				// draw player sprite
//				var player = this.game.players[i];
//				if (player.layer == layerIndex) {
//					this.context.save();
//					this.context.translate(0, -12);
//					this.context.drawImage(player.img, player.getFrame() * player.width, 0, player.width, player.height, player.x, player.y, player.width, player.height);
//					this.context.restore();
//				}
//			}
		}
	}
});