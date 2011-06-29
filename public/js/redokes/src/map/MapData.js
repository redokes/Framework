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

	constructor: function() {
		d('MapData constructor');
		this.tiles = [];
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
	}
});