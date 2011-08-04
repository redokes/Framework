Ext.define('Redokes.sprite.PlayerUser', {
	extend:'Redokes.sprite.Player',
	
	keyDown:false,
	dx:0,
	dy:0,
	speed:4,
	isMoving:false,
	lastActiveTile:false,

	startX:0,
	startY:0,
	destinationX:0,
	destinationY:0,

	initControls: function() {
		Ext.get(document).on('keydown', this.onKeyDown, this);
		Ext.get(document).on('keyup', this.onKeyUp, this);
	},

	onKeyDown: function(e) {
		switch (e.button) {
			case 31:
				e.preventDefault();
				this.checkTile();
			break;
			case 37:
//				this.setAnimationSpeed(++this.speed);
			break;
			case 39:
//				this.setAnimationSpeed(--this.speed);
			break;
		}
		
		/*
		 * e.button codes
		 * w = 86
		 * d = 67
		 * s = 82
		 * a = 64
		 * enter = 12
		 * 
		 */
		this.keyDown = e.button;
	},

	onKeyUp: function(e) {
		if (e.button == this.keyDown) {
			this.keyDown = false;
		}
	},

	checkKeys: function() {
		if (this.keyDown && !this.isMoving) {
			this.movementSpeed = this.speed;
			switch (this.keyDown) {
				case 86:
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
				case 67:
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
				case 82:
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
				case 64:
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
		this.game.socketManager.client.send(this.game.socketManager.instanceName, 'move', {
			animation:animation,
			startX:this.x,
			startY:this.y,
			dx:this.dx,
			dy:this.dy
		});
	},

	movePlayer: function() {
		this.x += this.dx;
		this.y += this.dy;
		if (this.dx > 0 && this.x >= this.destinationX) {
			this.activateTile();
			this.isMoving = false;

			// check if we need to stop or if we can keep going
			if (!this.canMoveRight() || (this.keyDown != 67 && this.dx)) {
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
			if (!this.canMoveLeft() || (this.keyDown != 64 && this.dx)) {
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
			if (!this.canMoveDown() || (this.keyDown != 82 && this.dy)) {
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
			if (!this.canMoveUp() || (this.keyDown != 86 && this.dy)) {
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
			var numActions = tile.actions.length;
			for (var i = 0; i < numActions; i++) {
				this[tile.actions[i].action](tile.actions[i].params);
			}
		}
	},

	getTileCoords: function() {
		return [Math.round(this.x / this.game.tileSize), Math.round(this.y / this.game.tileSize), this.layer];
	},
	
	changeLayer: function(params) {
		this.layer = params.layer;
	},
	
	teleport: function(params) {
		d('Teleport to ' + params.x + ', ' + params.y);
		if (!params.layer) {
			params.layer = this.layer;
		}
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
		this.setToTile(params.x, params.y, params.layer, this.game.tileSize);
		this.socketMovePlayer(this.currentAnimation.title);
	}
});