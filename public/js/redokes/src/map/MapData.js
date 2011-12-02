Ext.define('Redokes.map.MapData', {
	
	valueFields:['title', 'fileName', 'tileSheet', 'numLayers', 'width', 'height', 'spawnX', 'spawnY', 'spawnLayer', 'music', 'tileSize', 'tileData'],

	getValues: function() {
		var numValues = this.valueFields.length;
		var returnValues = {};
		for (var i = 0; i < numValues; i++) {
			returnValues[this.valueFields[i]] = this[this.valueFields[i]];
		}
		return returnValues;
	}
	
});