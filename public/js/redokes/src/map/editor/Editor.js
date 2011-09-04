Ext.define('Redokes.map.editor.Editor', {
	extend:'Ext.tab.Panel',
	height:300,
	activeTab:0,
	deferredRender:false,
	blankTile:{
		tileIndex:false,
		isWall:false
	},
	map:false,
	selectedTiles:[],
	currentLayer:0,
	clipboard:[],

	initComponent: function() {
		this.items = this.items || [];
		this.initPreviewTab();
		this.initGame();
		this.initListeners();
		this.callParent(arguments);
	},

	initPreviewTab: function() {
		this.settingsForm = Ext.create('Redokes.map.editor.Settings', {
			editor:this,
			collapsible:true
		});
		
		this.previewPanel = new Ext.panel.Panel({
			autoScroll:true,
			region:'center',
			tbar:[{
				text:'Copy',
				handler:this.copySelected,
				scope:this
			},{
				text:'Paste',
				handler:this.pasteSelected,
				scope:this
			},{
				text:'Paste All To Layer',
				handler:this.pasteAllToLayer,
				scope:this
			},{
				text:'Move Down Layer',
				handler:function() {
					this.moveTiles(0, 0, -1);
				},
				scope:this
			},{
				text:'Move Up Layer',
				handler:function() {
					this.moveTiles(0, 0, 1);
				},
				scope:this
			},{
				text:'TileActionLevel0',
				handler:function() {
					this.setTileProperties({
						changeLayer:0
					});
				},
				scope:this
			},{
				text:'TileActionLevel1',
				handler:function() {
					this.setTileProperties({
						changeLayer:1
					});
				},
				scope:this
			},{
				text:'Clear Tiles',
				handler:this.clearSelectedTiles,
				scope:this
			}]
		});
		
		this.tileViewer = new Ext.panel.Panel({
			region:'north',
			cls:'tileViewer',
			autoScroll:true
		});
		this.tileViewer.on('afterRender', function() {
			this.tileViewer.update('<div class="tileViewerWrap"></div>');
			this.tileViewerWrap = Ext.getBody().down('.tileViewerWrap');
			this.tileViewerWrap.on('click', this.tileViewerClick, this);
			this.tileViewer.setHeight(52);
			//this.tileViewer.update('really long text really long text really long text really long text really long text really long text really long text really long text really long text ');
		}, this);
		
		this.layerTree = Ext.create('Redokes.map.editor.Layers', {
			collapsible:true
		});
		
		this.layerTree.on('itemclick', function(view, record, item, index, e, options) {
			var clickedLayer = record.data.id.split('-')[1];
			this.currentLayer = clickedLayer;
			this.drawPreview();
		}, this)
		this.layerTree.on('checkchange', function(node, checked) {
			this.drawPreview();
		}, this);
		
		this.tilePropertiesForm = Ext.create('Redokes.map.editor.TileProperties', {
			editor:this,
			collapsible:true
		});
		
		this.westPanel = new Ext.panel.Panel({
			region:'west',
			layout:'accordion',
			items:[
				this.settingsForm,
				this.layerTree,
				this.tilePropertiesForm
			],
			width:280,
			collapsible:true,
			defaults: {
				// applied to each contained panel
				bodyStyle: 'padding:8px'
			}
		});
		
		this.mapSelector = Ext.create('Redokes.map.editor.MapSelector');
		
		this.previewTab = new Ext.panel.Panel({
			title:'Editor',
			layout:'border',
			items:[this.previewPanel, this.tileViewer, this.westPanel],
			tbar:[{
				text:'Create New Map',
				scope:this,
				handler:this.createMap
			},{
				text:'Save Map',
				scope:this,
				handler:this.saveMap
			},{
				scope:this,
				text:'Load Map',
				handler:this.loadMap
			},{
				scope:this,
				text:'Update',
				handler:this.updateMapSettings
			},
				this.mapSelector
			]
		});
		this.previewPanel.on('afterRender', function() {
			this.previewPanel.update('<div class="previewWrap"></div>');
			this.previewWrap = Ext.getBody().down('.previewWrap');
			this.previewCanvas = Ext.get(document.createElement('canvas'));
			this.previewWrap.appendChild(this.previewCanvas);
			this.previewContext = this.previewCanvas.dom.getContext('2d');
			this.previewWrap.on('click', this.onPreviewClick, this);
			this.previewTab.on('show', this.showPreview, this);
		}, this);

		this.items.push(this.previewTab);
	},
	
	initGame: function() {
		this.gamePanel = Ext.create('Redokes.game.Panel', {
			renderHidden:true
		});
		this.game = this.gamePanel.game;
		this.items.push(this.gamePanel);
	},
	
	initListeners: function() {
		this.gamePanel.on('afterrender', function() {
			this.setHeight(Ext.getBody().getHeight());
			this.game.map.on('mapload', function() {
				this.settingsForm.getForm().setValues(this.game.map.currentMap.getValues());
				
				this.map = new Image();
				this.map.onload = Ext.Function.bind(function() {
					this.showPreview();
				}, this);
				this.map.src = this.game.map.currentMap.tileSheet;
				
				this.tileViewerWrap.update('<img src="' + this.game.map.currentMap.tileSheet + '" />');
			}, this);
			
			this.loadMap();
		}, this);
		
		// listen for key events
		Ext.get(document).on('keydown', this.checkKeys, this);
		
		this.mapSelector.on('change', function(field, value) {
			this.game.map.loadMap(value);
		}, this);
	},
	
	checkKeys: function(e) {
//		for (var i in e) {
//			console.log(i);
//		}
		switch(e.keyCode) {
			case e.C:
				e.preventDefault();
				if (e.ctrlKey) {
					this.copySelected();
				}
			break;
			case e.V:
				e.preventDefault();
				if (e.ctrlKey) {
					this.pasteSelected();
				}
			break;
			case e.X:
				e.preventDefault();
				if (e.ctrlKey) {
					this.cutSelected();
				}
			break;
			case e.W:
				this.moveTiles(0, -1, 0);
			break;
			case e.A:
				this.moveTiles(-1, 0, 0);
			break;
			case e.S:
				e.preventDefault();
				if (e.ctrlKey) {
					this.saveMap();
				}
				else {
					this.moveTiles(0, 1, 0);
				}
			break;
			case e.D:
				this.moveTiles(1, 0, 0);
			break;
			case e.ONE:
				e.preventDefault();
				if (e.ctrlKey) {
					this.toggleLayerVisible(0);
				}
				else {
					this.setCurrentLayer(0);
				}
			break;
			case e.TWO:
				e.preventDefault();
				if (e.ctrlKey) {
					this.toggleLayerVisible(1);
				}
				else {
					this.setCurrentLayer(1);
				}
			break;
			case e.THREE:
				e.preventDefault();
				if (e.ctrlKey) {
					this.toggleLayerVisible(2);
				}
				else {
					this.setCurrentLayer(2);
				}
			break;
			case e.FOUR:
				e.preventDefault();
				if (e.ctrlKey) {
					this.toggleLayerVisible(3);
				}
				else {
					this.setCurrentLayer(3);
				}
			break;
			case e.FIVE:
				e.preventDefault();
				if (e.ctrlKey) {
					this.toggleLayerVisible(4);
				}
				else {
					this.setCurrentLayer(4);
				}
			break;
			
		}
	},
	
	toggleLayerVisible: function(layerIndex) {
		console.log('Toggle Layer ' + (layerIndex+1));
		var node = this.layerTree.store.getNodeById('layer-' + layerIndex);
		node.data.checked = !node.data.checked;
		node.set();
		this.layerTree.fireEvent('checkchange', node, node.data.checked);
	},
	
	setCurrentLayer: function(layerIndex) {
		console.log('Set current layer to ' + (layerIndex+1));
		this.currentLayer = layerIndex;
	},
	
	createMap: function() {
		this.createWindow = Ext.create('Ext.window.Window', {
			title:'Create New Map',
			autoShow:true,
			items:[
				Ext.create('Redokes.map.editor.Create')
			]
		});
	},
	
	loadMap: function() {
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:'/wes/process/load-map',
			params:{
				fileName:this.settingsForm.fileField.getValue()
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				this.game.map.loadMap(response.fileName);
			}
		});
	},

	showPreview: function() {
		d('Show Preview');
		// update canvas size
		var width = this.game.map.currentMap.width * this.game.map.currentMap.tileSize;
		var height = this.game.map.currentMap.height * this.game.map.currentMap.tileSize;
		
		this.previewCanvas.set({
			width:width,
			height:height
		});
		this.previewWrap.setStyle({
			width:width + 'px',
			height:(height + 52) + 'px',
			border:'1px solid black'
		});

		// init tile array
		var numLayers = this.game.map.currentMap.numLayers;
		var numRows = this.game.map.currentMap.height;
		var numColumns = this.game.map.currentMap.rows;
		
		for (var layerIndex = 0; layerIndex < numLayers; layerIndex++) {
			this.game.map.currentMap.tileData[layerIndex] = this.game.map.currentMap.tileData[layerIndex];
			
			for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
				this.game.map.currentMap.tileData[layerIndex][rowIndex] = this.game.map.currentMap.tileData[layerIndex][rowIndex];
				
				for (var columnIndex = 0; columnIndex < numColumns; columnIndex++) {
					this.game.map.currentMap.tileData[layerIndex][rowIndex][columnIndex] = this.game.map.currentMap.tileData[layerIndex][rowIndex][columnIndex] || this.getBlankTile();
				}
			}
		}
		this.drawPreview();
	},

	getBlankTile: function() {
		var blank = Ext.apply({}, this.blankTile);
		return blank;
	},

	drawPreview: function() {
		d('Draw Preview');
		this.previewContext.clearRect(0, 0, this.previewCanvas.dom.width, this.previewCanvas.dom.height);
		
		// loop through each layer
		var numLayers = this.game.map.currentMap.numLayers;
		var numRows = this.game.map.currentMap.height;
		var numColumns = this.game.map.currentMap.width;
		var tileSize = this.game.map.currentMap.tileSize;
		
//		for (var layerIndex = 0; layerIndex < numLayers && layerIndex <= this.currentLayer; layerIndex++) {
		for (var layerIndex = 0; layerIndex < numLayers; layerIndex++) {

			// check if this layer is visible
			if (this.layerTree.store.getNodeById('layer-' + layerIndex).data.checked) {
				
				// check if we need to draw the tiles
				if (this.layerTree.store.getNodeById('tiles-' + layerIndex).data.checked) {
					
					for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
						
						for (var columnIndex = 0; columnIndex < numColumns; columnIndex++) {
							// draw the tile
							var tile = this.game.map.currentMap.tileData[layerIndex][rowIndex][columnIndex];
							var tileIndex = tile.tileIndex;
							if (tile.tileIndex !== false) {
								this.previewContext.drawImage(this.map, tileIndex * tileSize, 0, tileSize, tileSize, columnIndex * tileSize, rowIndex * tileSize, tileSize, tileSize);
							}
						}
					}
				}

				// check if we need to draw the walls
				if (this.layerTree.store.getNodeById('walls-' + layerIndex).data.checked) {
					for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
						for (var columnIndex = 0; columnIndex < numColumns; columnIndex++) {
							var tile = this.game.map.currentMap.tileData[layerIndex][rowIndex][columnIndex];
							var tileIndex = tile.tileIndex;
							if (tile.isWall) {
								this.previewContext.fillStyle = "rgba(255, 255, 0, 0.75)";
								this.previewContext.fillRect(columnIndex * tileSize, rowIndex * tileSize, tileSize, tileSize);
							}
						}
					}
				}
			}
		}
	},

	onPreviewClick: function(e) {
		var previewXY = this.previewWrap.getXY();
		var clickXY = [e.browserEvent.pageX, e.browserEvent.pageY];
		var clickedX = clickXY[0] - previewXY[0];
		var clickedY = clickXY[1] - previewXY[1];
		var tileXY = [Math.floor(clickedX / this.game.map.currentMap.tileSize), Math.floor(clickedY / this.game.map.currentMap.tileSize), this.currentLayer];

		if (e.ctrlKey) {
			this.selectTile(tileXY);
		}
		else if (e.shiftKey && this.selectedTiles.length) {
			// get rid of all but last selected item in selected tile array
			this.selectedTiles = [this.selectedTiles.pop()];
			var lastXY = this.selectedTiles[0];
			
			// highlight all tiles up to the new clicked tile
			// within the constraints
			var selectionWidth = tileXY[0] - this.selectedTiles[0][0];
			var selectionHeight = tileXY[1] - this.selectedTiles[0][1];
			var startCoord = [lastXY[0], lastXY[1]];
			var stopCoord = [tileXY[0], tileXY[1]];
			if (selectionWidth != 0 || selectionHeight != 0) {
				if (selectionWidth < 0) {
					startCoord[0] = tileXY[0];
					stopCoord[0] = lastXY[0];
				}
				if (selectionHeight < 0) {
					startCoord[1] = tileXY[1];
					stopCoord[1] = lastXY[1];
				}
				selectionWidth = Math.abs(selectionWidth) + 1;
				selectionHeight = Math.abs(selectionHeight) + 1;
				this.selectedTiles = [];
				for (var i = 0; i < selectionHeight; i++) {
					for (var j = 0; j < selectionWidth; j++) {
						this.selectTile([startCoord[0] + j, startCoord[1] + i, parseInt(this.currentLayer)]);
					}
				}
			}
		}
		else {
			this.removeHighlights();
			this.selectedTiles = [];
			this.selectTile(tileXY);
		}
	},

	selectTile: function(xy) {
		this.selectedTiles.push(xy);
		this.highlightTile(xy);
		this.updateTilePropertiesForm();
	},
	
	updateTilePropertiesForm: function() {
		if (this.selectedTiles.length == 1) {
			var tile = this.selectedTiles[0];
			if (isNaN(tile[0]) || isNaN(tile[1]) || isNaN(tile[2])) {
				return false;
			}
			var tileData = this.game.map.currentMap.tileData[tile[2]][tile[1]][tile[0]];
			var params = {
				x:tile[0],
				y:tile[1],
				layer:tile[2]
			};
			Ext.apply(params, tileData);
			this.tilePropertiesForm.tileFormIsWall.suspendEvents();
			
			// loop through actions
			var actions = tileData.actions || {};
			params.teleport = '';
			params.loadMap = '';
			params.loadMapCoords = '';
			for (var i in actions) {
				if (actions[i].action == 'teleport') {
					params.teleport = actions[i].params.x + ',' + actions[i].params.y + ',' + actions[i].params.layer
				}
				else if (actions[i].action == 'loadMap') {
					params.loadMap = actions[i].params.title;
				}
				else if (actions[i].action == 'loadMapCoords') {
					params.loadMapCoords = actions[i].params.x + ',' + actions[i].params.y + ',' + actions[i].params.layer;
				}
			}
			
			this.tilePropertiesForm.getForm().setValues(params);
			
			this.tilePropertiesForm.tileFormIsWall.resumeEvents();
		}
	},
	
	highlightTile: function(xy) {
		var tileHighlight = Ext.get(document.createElement('div'));
		tileHighlight.addCls('tileHighlight');
		tileHighlight.setStyle({
			width:this.game.map.currentMap.tileSize + 'px',
			height:this.game.map.currentMap.tileSize + 'px',
			left:(xy[0] * this.game.map.currentMap.tileSize + 2) + 'px',
			top:(xy[1] * this.game.map.currentMap.tileSize + 2) + 'px'
		});
		this.previewWrap.appendChild(tileHighlight);
	},

	removeHighlights: function() {
		this.previewWrap.select('.tileHighlight').remove();
	},

	tileViewerClick: function(e) {
		var tileViewerXY = this.tileViewerWrap.getXY();
		var clickXY = [e.browserEvent.x, e.browserEvent.y];
		var clickedX = clickXY[0] - tileViewerXY[0];
		var clickedY = clickXY[1] - tileViewerXY[1];
		var tileXY = [Math.floor(clickedX / this.game.map.currentMap.tileSize), Math.floor(clickedY / this.game.map.currentMap.tileSize)];
		var tileIndex = tileXY[0];
		
		// update the map grid
		for (var i = 0; i < this.selectedTiles.length; i++) {
			var x = this.selectedTiles[i][0];
			var y = this.selectedTiles[i][1];
			this.game.map.currentMap.tileData[this.currentLayer][y][x].tileIndex = tileIndex;
		}
		
		this.drawPreview();
	},

	setViewLayer: function(newLayer) {
		d('Set View Layer ' + newLayer);
		if (newLayer >= 0 && newLayer < this.game.map.currentMap.numLayers) {
			this.currentLayer = newLayer;
			this.drawPreview();
		}
	},
	
	getSelectedTiles: function() {
		var selectedTiles = this.selectedTiles.copy();
		var numSelected = selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			selectedTiles[i] = selectedTiles[i].copy();
		}
		return selectedTiles;
	},
	
	cutSelected: function() {
		var numSelected = this.selectedTiles.length;
		if (numSelected) {
			this.clipboard.push(this.selectedTiles);
			for (var i = 0; i < numSelected; i++) {
				var tileCoords = this.selectedTiles[i];
				this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]] = this.getBlankTile();
			}
		}
		this.drawPreview();
	},
	
	copySelected: function() {
		if (this.selectedTiles.length) {
			this.clipboard.push(this.selectedTiles);
		}
	},

	pasteSelected: function(clipboardIndex) {
		if (isNaN(clipboardIndex)) {
			clipboardIndex = this.clipboard.length - 1;
		}
		clipboardIndex = clipboardIndex || (this.clipboard.length - 1);
		var numSelected = this.selectedTiles.length;
		if (clipboardIndex >= 0 && numSelected) {
			for (var selectedTileIndex = 0; selectedTileIndex < numSelected; selectedTileIndex++) {
				var originPointTile = this.selectedTiles[selectedTileIndex];
				var clipboardTiles = this.clipboard[clipboardIndex];
				var numClipboardSelected = clipboardTiles.length;
				if (numClipboardSelected) {
					var destinationPointTile = clipboardTiles[0];
					var dx = originPointTile[0] - destinationPointTile[0];
					var dy = originPointTile[1] - destinationPointTile[1];
					for (var i = 0; i < numClipboardSelected; i++) {
						var tileCoords = clipboardTiles[i];
						var originTile = this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]];
						var transposedX = tileCoords[0] + dx;
						var transposedY = tileCoords[1] + dy;
						if (transposedX >= 0 && transposedX < this.game.map.currentMap.width && transposedY >= 0 && transposedY < this.game.map.currentMap.height) {
							Ext.apply(this.game.map.currentMap.tileData[tileCoords[2]][transposedY][transposedX], originTile);
						}
					}
				}
			}
		}
		this.drawPreview();
	},
	
	pasteAllToLayer: function(clipboardIndex) {
		if (isNaN(clipboardIndex)) {
			clipboardIndex = this.clipboard.length - 1;
		}
		clipboardIndex = clipboardIndex || (this.clipboard.length - 1);
		var numSelected = this.selectedTiles.length;
		if (clipboardIndex >= 0 && numSelected) {
			for (var selectedTileIndex = 0; selectedTileIndex < numSelected; selectedTileIndex++) {
				var originPointTile = this.selectedTiles[selectedTileIndex];
				var clipboardTiles = this.clipboard[clipboardIndex];
				var numClipboardSelected = clipboardTiles.length;
				if (numClipboardSelected) {
					var destinationPointTile = clipboardTiles[0];
					var dx = originPointTile[0] - destinationPointTile[0];
					var dy = originPointTile[1] - destinationPointTile[1];
					for (var i = 0; i < numClipboardSelected; i++) {
						var tileCoords = clipboardTiles[i];
						var originTile = this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]];
						var transposedX = tileCoords[0] + dx;
						var transposedY = tileCoords[1] + dy;
						if (transposedX >= 0 && transposedX < this.game.map.currentMap.width && transposedY >= 0 && transposedY < this.game.map.currentMap.height) {
							this.game.map.currentMap.tileData[this.currentLayer][transposedY][transposedX].tileIndex = originTile.tileIndex;
							this.game.map.currentMap.tileData[this.currentLayer][transposedY][transposedX].isWall = originTile.isWall;
						}
					}
				}
			}
		}
		this.drawPreview();
	},
	
	moveTiles: function(dx, dy, dlayer) {
		var numSelected = this.selectedTiles.length;
		dlayer = parseInt(dlayer);
		for (var i = 0; i < numSelected; i++) {
			var tileCoords = this.selectedTiles[i];
			var tile = this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]];
			if (dx) {
				var newX = parseInt(tileCoords[0]) + dx;
				this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][newX].tileIndex = tile.tileIndex;
				this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][newX].isWall = tile.isWall;
				this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]] = this.getBlankTile();
			}
			if (dy) {
				var newY = parseInt(tileCoords[1]) + dy;
				this.game.map.currentMap.tileData[tileCoords[2]][newY][tileCoords[0]].tileIndex = tile.tileIndex;
				this.game.map.currentMap.tileData[tileCoords[2]][newY][tileCoords[0]].isWall = tile.isWall;
				this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]] = this.getBlankTile();
			}
			if (dlayer) {
				var newLayer = parseInt(tileCoords[2]) + dlayer;
				if (newLayer >= 0 && newLayer < this.game.map.currentMap.numLayers) {
					this.game.map.currentMap.tileData[newLayer][tileCoords[1]][tileCoords[0]].tileIndex = tile.tileIndex;
					this.game.map.currentMap.tileData[newLayer][tileCoords[1]][tileCoords[0]].isWall = tile.isWall;
					this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]] = this.getBlankTile();
				}
			}
		}
		
		this.transposeSelection(dx, dy, dlayer);
	},
	
	transposeSelection: function(dx, dy, dlayer) {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			this.selectedTiles[i][0] += dx;
			this.selectedTiles[i][1] += dy;
			this.selectedTiles[i][2] += dlayer;
		}
		
		this.drawPreview();
	},
	
	moveSelectedTo: function(newLayer) {
		d('Move Selected To ' + newLayer);
		if (newLayer >= 0 && newLayer < this.game.map.currentMap.numLayers) {
			var numSelected = this.selectedTiles.length;
			for (var i = 0; i < numSelected; i++) {
				var tileCoords = this.selectedTiles[i];
				var tile = this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]];
				this.game.map.currentMap.tileData[newLayer][tileCoords[1]][tileCoords[0]].tileIndex = tile.tileIndex;
				this.game.map.currentMap.tileData[newLayer][tileCoords[1]][tileCoords[0]].isWall = tile.isWall;
				this.game.map.currentMap.tileData[this.currentLayer][tileCoords[1]][tileCoords[0]] = this.getBlankTile();
			}
			this.currentLayer = newLayer;
			this.drawPreview();
		}
	},

	setAsWall: function(isWall) {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			var tile = this.selectedTiles[i];
			this.game.map.currentMap.tileData[tile[2]][tile[1]][tile[0]].isWall = isWall;
		}
		this.drawPreview();
	},
	
	setTileAction: function(name, params) {
		var numSelected = this.selectedTiles.length;
		console.log('set tile action ' + name);
		for (var i = 0; i < numSelected; i++) {
			var tileCoords = this.selectedTiles[i];
			var tile = this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]];
			if (!tile.actions) {
				this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]].actions = {};
			}
			
			this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]].actions[name] = {
				action:name,
				params:params
			};
			console.log(this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]].actions);
		}
		this.drawPreview();
	},
	
	removeTileAction: function(name) {
		var numSelected = this.selectedTiles.length;
		console.log('remove tile action ' + name);
		for (var i = 0; i < numSelected; i++) {
			var tileCoords = this.selectedTiles[i];
			var tile = this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]];
			if (!tile.actions) {
				this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]].actions = {};
			}
			
			delete this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]].actions[name];
			console.log(this.game.map.currentMap.tileData[tileCoords[2]][tileCoords[1]][tileCoords[0]].actions);
		}
		this.drawPreview();
	},

	setTileProperties: function(properties) {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			var tile = this.selectedTiles[i];
			Ext.apply(this.game.map.currentMap.tileData[tile[2]][tile[1]][tile[0]], properties);
		}
	},
	
	clearSelectedTiles: function() {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			var tile = this.selectedTiles[i];
			this.game.map.currentMap.tileData[tile[2]][tile[1]][tile[0]].tileIndex = false;
		}
		this.drawPreview();
	},

	toggleWalls: function() {
		d('Toggle Walls');
		this.drawPreview();
	},
	
	saveMap: function() {
		var mapData = this.game.map.currentMap.getValues();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:'/wes/process/save-map',
			params:{
				mapData:Ext.encode(mapData)
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				console.log('Saved');
				
			}
		});
	},
	
	updateMapSettings: function() {
		Ext.apply(this.game.map.currentMap, this.settingsForm.getForm().getValues());
		this.showPreview();
	},
	
	updateMapSize: function() {
		var newWidth = this.settingsForm.widthField.getValue();
		var newHeight = this.settingsForm.heightField.getValue();
		var newLayer = this.settingsForm.numLayersField.getValue();
		var oldHeight = this.game.map.currentMap.tileData[0].length;
		var oldWidth = this.game.map.currentMap.tileData[0][0].length;
		var oldLayer = this.game.map.currentMap.tileData.length;
		
		if (oldLayer < newLayer) {
			// Need to add a layer
			for (var layerIndex = oldLayer; layerIndex < newLayer; layerIndex++) {
				
				// Create empty layer
				this.game.map.currentMap.tileData.push([]);
				
				// Loop through to create empty rows
				for (var rowIndex = 0; rowIndex < this.game.map.currentMap.height; rowIndex++) {
					
					// Create empty row
					this.game.map.currentMap.tileData[layerIndex].push([]);
					
					// Create empty column array
					this.game.map.currentMap.tileData[layerIndex][rowIndex].push([]);
					
					// Loop through to add the tiles
					for (var columnIndex = 0; columnIndex < this.game.map.currentMap.width; columnIndex++) {
						this.game.map.currentMap.tileData[layerIndex][rowIndex][columnIndex] = this.getBlankTile();
					}
				}
			}
		}
		else if (oldLayer > newLayer) {
			// Need to remove a layer
			this.game.map.currentMap.tileData.splice(newLayer, oldLayer - newLayer);
		}
		
//		console.log('Update map size');
//		console.log(this.game.map.currentMap.tileData[0][0].length + 'x' + this.game.map.currentMap.tileData[0].length);
		
		if (oldHeight < newHeight) {
			// Need to add some rows
			for (var layerIndex = 0; layerIndex < this.game.map.currentMap.tileData.length; layerIndex++) {
				// build empty rows
				for (var rowIndex = oldHeight; rowIndex < newHeight; rowIndex++) {
					this.game.map.currentMap.tileData[layerIndex].push([]);
					this.game.map.currentMap.tileData[layerIndex][rowIndex].push([]);
					for (var columnIndex = 0; columnIndex < newWidth; columnIndex++) {
						this.game.map.currentMap.tileData[layerIndex][rowIndex][columnIndex] = this.getBlankTile();
					}
				}
			}
		}
		else if (oldHeight > newHeight) {
			// Need to remove some rows
			for (var layerIndex = 0; layerIndex < this.game.map.currentMap.tileData.length; layerIndex++) {
				// trim the layer's rows
				this.game.map.currentMap.tileData[layerIndex].splice(newHeight, oldHeight - newHeight);
			}
		}
		if (oldWidth < newWidth) {
			// Need to add some columns
			for (var layerIndex = 0; layerIndex < this.game.map.currentMap.tileData.length; layerIndex++) {
				for (var rowIndex = 0; rowIndex < newHeight; rowIndex++) {
					for (var columnIndex = oldWidth; columnIndex < newWidth; columnIndex++) {
						this.game.map.currentMap.tileData[layerIndex][rowIndex][columnIndex] = this.getBlankTile();
					}
				}
			}
		}
		else if (oldWidth > newWidth) {
			// Need to remove some columns
			for (var layerIndex = 0; layerIndex < this.game.map.currentMap.tileData.length; layerIndex++) {
				for (var rowIndex = 0; rowIndex < newHeight; rowIndex++) {
				// trim the row's columns
					this.game.map.currentMap.tileData[layerIndex][rowIndex].splice(newWidth, oldWidth - newWidth);
				}
			}
		}
		
		this.updateMapSettings();
		
//		console.log(this.game.map.currentMap.tileData[0][0].length + 'x' + this.game.map.currentMap.tileData[0].length);
		
	},
	
	removeExtraTileData: function() {
		// loop through and actually remove the extra tile data
		var newWidth = this.settingsForm.widthField.getValue();
		var newHeight = this.settingsForm.heightField.getValue();
		var oldHeight = this.game.map.currentMap.tileData[0].length;
		var oldWidth = this.game.map.currentMap.tileData[0][0].length;
		
		for (var layerIndex = 0; layerIndex < this.game.map.currentMap.tileData.length; layerIndex++) {
			
			// trim the layer's rows
			this.game.map.currentMap.tileData[layerIndex].splice(newHeight, oldHeight - newHeight);
			
			for (var rowIndex = 0; rowIndex < newHeight; rowIndex++) {
				// trim the row's columns
				this.game.map.currentMap.tileData[layerIndex][rowIndex].splice(newWidth, oldWidth - newWidth);
			}
		}
	}
	
});