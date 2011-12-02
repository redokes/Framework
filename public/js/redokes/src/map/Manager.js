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
//		this.showLog();
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
		
	},

	loadMap: function(mapName, loadMapCoords) {
		this.log('Load map: ' + mapName);
		
		// Make sure there is a map name
		if (!mapName.length) {
			return;
		}
		
		// Check if this map has already had its resources loaded
		if (this.loadedMaps[mapName] || this.forceLoad) {
			this.loadedMaps[mapName].loadMapCoords = loadMapCoords;
			this.loadedMaps[mapName].process();
		}
		else {
			// Create the map instance
			var clsName = 'Redokes.map.data.' + mapName;
			var map = Ext.create(clsName, {
				mapName: mapName,
				game: this.game
			});
			
			// Listen for the map to load so we can mark it as loaded
			map.on('mapload', function(params) {
				// Set the map as loaded
				this.loadedMaps[mapName] = params.map;
				
				// Remove the player from the map socket
				if (this.currentMap && this.game.hasSocket) {
					this.currentMap.socket.send('player.leavemap');
				}
				
				this.currentMap = this.loadedMaps[mapName];
				
				this.currentMap.initMapSocket();
				
				this.fireEvent('mapload', this, this.loadedMaps[mapName]);
			}, this, {
				map: map
			});
		}
	}
	
});