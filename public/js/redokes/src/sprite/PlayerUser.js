Ext.define('Redokes.sprite.PlayerUser', {
	extend:'Redokes.sprite.Player',
	
	keyDown:false,
	dx:0,
	dy:0,
	isMoving:false,
	lastActiveTile:false,

	startX:0,
	startY:0,
	destinationX:0,
	destinationY:0,
	
	ignoreInput:false,

	initControls: function() {
		Ext.get(document).on('keydown', this.onKeyDown, this);
		Ext.get(document).on('keyup', this.onKeyUp, this);
	},

	onKeyDown: function(e) {
		if (this.ignoreInput) {
			return;
		}
		switch (e.keyCode) {
			case e.SPACE:
				e.preventDefault();
				this.checkTile();
			break;
			case e.UP:
				this.setPlayerData({
					life:this.playerData.life+1
				});
			break;
			case e.DOWN:
				this.setPlayerData({
					life:this.playerData.life-1
				});
			break;
		}
	
		this.keyDown = e.keyCode;
	},

	onKeyUp: function(e) {
		if (e.keyCode == this.keyDown) {
			this.keyDown = false;
		}
	},

	checkKeys: function() {
		if (this.ignoreInput) {
			return;
		}
		if (this.keyDown && !this.isMoving) {
			this.movementSpeed = this.playerData.speed;
			switch (this.keyDown) {
				case 87:
					this.facing = 0;
					
					// make sure player can walk up
					if (this.canMoveUp()) {
						this.isMoving = true;
						this.dy = 0 - this.movementSpeed;
						this.dx = 0;
						this.destinationY = this.tileY * this.game.tileSize - this.game.tileSize;
						this.playAnimation('walkUp');
						this.socketMovePlayer('walkUp');
					}
					else {
						this.playAnimation('faceUp');
						this.socketMovePlayer('faceUp');
					}
				break;
				case 68:
					this.facing = 1;
					
					// make sure player can walk right
					if (this.canMoveRight()) {
						this.isMoving = true;
						this.dx = this.movementSpeed;
						this.dy = 0;
						this.destinationX = this.tileX * this.game.tileSize + this.game.tileSize;
						this.playAnimation('walkRight');
						this.socketMovePlayer('walkRight');
					}
					else {
						this.playAnimation('faceRight');
						this.socketMovePlayer('faceRight');
					}
				break;
				case 83:
					this.facing = 2;
					
					// make sure player can walk down
					if (this.canMoveDown()) {
						this.isMoving = true;
						this.dy = this.movementSpeed;
						this.dx = 0;
						this.destinationY = this.tileY * this.game.tileSize + this.game.tileSize;
						this.playAnimation('walkDown');
						this.socketMovePlayer('walkDown');
					}
					else {
						this.playAnimation('faceDown');
						this.socketMovePlayer('faceDown');
					}
				break;
				case 65:
					this.facing = 3;
					
					// make sure player can walk left
					if (this.canMoveLeft()) {
						this.isMoving = true;
						this.dx = 0 - this.movementSpeed;
						this.dy = 0;
						this.destinationX = this.tileX * this.game.tileSize - this.game.tileSize;
						this.playAnimation('walkLeft');
						this.socketMovePlayer('walkLeft');
					}
					else {
						this.playAnimation('faceLeft');
						this.socketMovePlayer('faceLeft');
					}
				break;
				default:
					this.keyDown = false;
					this.dx = 0;
					this.dy = 0;
				break;
			}
		}
	},

	canMoveRight: function() {
		if (this.tileX < this.game.map.currentMap.tileData[this.layer][this.tileY].length-1) {
			var tile = this.game.map.currentMap.tileData[this.layer][this.tileY][this.tileX+1];
			if (!tile.isWall) {
				return true;
			}
		}
		return false;
	},
	
	canMoveLeft: function() {
		if (this.tileX) {
			var tile = this.game.map.currentMap.tileData[this.layer][this.tileY][this.tileX-1];
			if (!tile.isWall) {
				return true;
			}
		}
		return false;
	},

	canMoveUp: function() {
		if (this.tileY) {
			var tile = this.game.map.currentMap.tileData[this.layer][this.tileY-1][this.tileX];
			if (!tile.isWall) {
				return true;
			}
		}
		return false;
	},

	canMoveDown: function() {
		if (this.tileY < this.game.map.currentMap.tileData[this.layer].length-1) {
			var tile = this.game.map.currentMap.tileData[this.layer][this.tileY+1][this.tileX];
			if (!tile.isWall) {
				return true;
			}
		}
		return false;
	},
	
	updateRemotePlayer: function(data) {
//		console.log('update remote player');
//		console.log(data);
		this.x = data.startX;
		this.y = data.startY;
		this.dx = data.dx;
		this.dy = data.dy;
		this.playAnimation(data.animation);
	},
	
	moveRemotePlayer: function() {
		this.x += this.dx;
		this.y += this.dy;
	},
	
	socketMovePlayer: function(animation) {
		if (this.game.map.currentMap.socket) {
			this.game.map.currentMap.socket.send('player.move', {
				animation:animation,
				startX:this.x,
				startY:this.y,
				dx:this.dx,
				dy:this.dy
			});
		}
	},

	movePlayer: function() {
		this.x += this.dx;
		this.y += this.dy;
		if (this.dx > 0 && this.x >= this.destinationX) {
			this.activateTile();
			this.isMoving = false;

			// check if we need to stop or if we can keep going
			if (!this.canMoveRight() || (this.keyDown != 68 && this.dx)) {
				this.x = this.destinationX;
				this.dx = 0;
				this.playAnimation('faceRight');
				this.socketMovePlayer('faceRight');
			}
		}
		else if (this.dx < 0 && this.x <= this.destinationX) {
			this.activateTile();
			this.isMoving = false;
			
			// check if we need to stop or if we can keep going
			if (!this.canMoveLeft() || (this.keyDown != 65 && this.dx)) {
				this.x = this.destinationX;
				this.dx = 0;
				this.playAnimation('faceLeft');
				this.socketMovePlayer('faceLeft');
			}
		}
		else if (this.dy > 0 && this.y >= this.destinationY) {
			this.activateTile();
			this.isMoving = false;

			// check if we need to stop or if we can keep going
			if (!this.canMoveDown() || (this.keyDown != 83 && this.dy)) {
				this.y = this.destinationY;
				this.dy = 0;
				this.playAnimation('faceDown');
				this.socketMovePlayer('faceDown');
			}
		}
		else if (this.dy < 0 && this.y <= this.destinationY) {
			this.activateTile();
			this.isMoving = false;

			// check if we need to stop or if we can keep going
			if (!this.canMoveUp() || (this.keyDown != 87 && this.dy)) {
				this.y = this.destinationY;
				this.dy = 0;
				this.playAnimation('faceUp');
				this.socketMovePlayer('faceUp');
			}
		}
	},
	
	checkTile: function() {
		if (this.isMoving) {
			
		}
		else {
			var checkCoords = [-1, -1];
			switch (this.facing) {
				case 0:
					checkCoords = [this.tileX, this.tileY - 1];
				break;
				
				case 1:
					checkCoords = [this.tileX + 1, this.tileY];
				break;
				
				case 2:
					checkCoords = [this.tileX, this.tileY + 1];
				break;
				
				case 3:
					checkCoords = [this.tileX - 1, this.tileY];
				break;
			}
			
			// Make sure check coordinates are within the map boundaries
			if (checkCoords[0] >= 0 && checkCoords[1] >= 0 && checkCoords[0] < this.game.map.currentMap.width && checkCoords[1] < this.game.map.currentMap.height) {
				// Valid trigger. Need to check for an action to perform
				
			}
		}
	},

	activateTile: function() {
		var coords = this.getTileCoords();
		this.tileX = coords[0];
		this.tileY = coords[1];
		var tile = this.game.map.currentMap.tileData[this.layer][this.tileY][this.tileX];
		if (tile.actions) {
			for (var i in tile.actions) {
				this[tile.actions[i].action](tile.actions[i].params, tile);
			}
		}
	},

	getTileCoords: function() {
		return [Math.round(this.x / this.game.tileSize), Math.round(this.y / this.game.tileSize), this.layer];
	},
	
	changeLayer: function(params) {
		this.layer = params.layer;
	},
	
	stopMoving: function() {
		if (this.dx < 0) {
			this.playAnimation('faceLeft');
		}
		else if (this.dx > 0) {
			this.playAnimation('faceRight');
		}
		else if (this.dy < 0) {
			this.playAnimation('faceUp');
		}
		else if (this.dy > 0) {
			this.playAnimation('faceDown');
		}
		this.dx = 0;
		this.dy = 0;
	},
	
	teleport: function(params) {
		d('Teleport to ' + params.x + ', ' + params.y);
		if (!params.layer) {
			params.layer = this.layer;
		}
		this.stopMoving();
		this.setToTile(params.x, params.y, params.layer, this.game.tileSize);
	},
	
	loadMap: function(params, tile) {
		this.stopMoving();
		this.socketMovePlayer(this.currentAnimation.title);
		var loadMapCoords = tile.actions.loadMapCoords || false;
		if (loadMapCoords) {
			loadMapCoords = loadMapCoords.params;
		}
		this.game.map.loadMap(params.title, loadMapCoords);
	},
	
	loadMapCoords: function(params) {
		
	},
	
	setToTile: function() {
		this.callParent(arguments);
		this.socketMovePlayer(this.currentAnimation.title);
	}
});