Ext.define('Redokes.map.Editor', {
	extend:'Ext.tab.Panel',
	
	activeTab:0,
	blankTile:{
		tileIndex:false,
		isWall:false
	},
	mapSettings:{
		title:'Map',
		file:'Default',
		numLayers:2,
		width:10,
		height:10,
		tileSize:32,
		tileData:[],
		tileSheet:'/modules/wes/img/sprites/maps/town-tiles.png',
		spawnX:0,
		spawnY:0,
		spawnLayer:0
	},
	mapLoaded:false,
	map:false,
	selectedTiles:[],
	currentLayer:0,
	visibleItems:{},

	initComponent: function() {
		this.items = [];
		this.loadMap();
		this.initSettingsTab();
		this.initPreviewTab();
		this.initCodeTab();

		this.callParent(arguments);
	},

	loadMap: function() {
		this.map = new Image();
		this.map.src = this.mapSettings.tileSheet;
	},

	initSettingsTab: function() {
		this.settingsForm = new Ext.form.Panel({
			title:'Settings Tab'
		});
		this.settingsForm.add({
			fieldLabel:'Title',
			name:'title',
			xtype:'textfield',
			value:this.mapSettings.title
		});
		this.settingsForm.add({
			fieldLabel:'File',
			name:'file',
			xtype:'textfield',
			value:this.mapSettings.file
		});
		this.settingsForm.add({
			fieldLabel:'Spawn X',
			name:'spawnX',
			xtype:'textfield',
			value:this.mapSettings.spawnX
		});
		this.settingsForm.add({
			fieldLabel:'Spawn Y',
			name:'spawnY',
			xtype:'textfield',
			value:this.mapSettings.spawnY
		});
		this.settingsForm.add({
			fieldLabel:'Spawn Layer',
			name:'spawnLayer',
			xtype:'textfield',
			value:this.mapSettings.spawnLayer
		});
		this.settingsForm.add({
			fieldLabel:'# Layers',
			name:'numLayers',
			xtype:'textfield',
			value:this.mapSettings.numLayers
		});
		this.settingsForm.add({
			fieldLabel:'Width',
			name:'width',
			xtype:'textfield',
			value:this.mapSettings.width
		});
		this.settingsForm.add({
			fieldLabel:'Height',
			name:'height',
			xtype:'textfield',
			value:this.mapSettings.height
		});
		this.settingsForm.add({
			fieldLabel:'Tile Size',
			name:'tileSize',
			xtype:'textfield',
			value:this.mapSettings.tileSize
		});
		this.items.push(this.settingsForm);
	},

	initPreviewTab: function() {
		this.previewPanel = new Ext.panel.Panel({
			autoScroll:true,
			region:'center',
			tbar:[{
				text:'Down Layer',
				handler:function() {
					this.setViewLayer(this.currentLayer-1);
				},
				scope:this
			},{
				text:'Up Layer',
				handler:function() {
					this.setViewLayer(this.currentLayer+1);
				},
				scope:this
			},{
				text:'Copy',
				handler:this.copySelected,
				scope:this
			},{
				text:'Paste',
				handler:this.pasteSelected,
				scope:this
			},{
				text:'Move Selected Down Layer',
				handler:function() {
					this.moveSelectedTo(this.currentLayer-1);
				},
				scope:this
			},{
				text:'Move Selected Up Layer',
				handler:function() {
					this.moveSelectedTo(this.currentLayer+1);
				},
				scope:this
			},{
				text:'Set as Wall',
				handler:this.setAsWall,
				scope:this
			},{
				text:'Unset Wall',
				handler:this.unsetWall,
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
				text:'Show Walls',
				handler:this.toggleWalls,
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
			this.tileViewerWrap.update('<img src="'+this.mapSettings.tileSheet+'" />');
			this.tileViewerWrap.on('click', this.tileViewerClick, this);
			this.tileViewer.setHeight(parseInt(this.mapSettings.tileSize) + 20);
			//this.tileViewer.update('really long text really long text really long text really long text really long text really long text really long text really long text really long text ');
		}, this);
		
//		
//		this.layerTreeStore = Ext.create('Ext.data.TreeStore', {
//			
//		});
//		
//		this.layerTree = Ext.create('Ext.tree.Panel', {
//			region: 'west',
//			collapsible: true,
//			title: 'Layer Visibility',
//			width: 200,
//			autoScroll: true,
//			split: true,
//			loader: new Ext.tree.TreeLoader(),
//			root: new Ext.tree.AsyncTreeNode({
//				expanded: true,
//				children: [{
//					text: 'Layer 1',
//					checked:true,
//					expanded:true,
//					id:'layer0',
//					layer:0,
//					children:[{
//						text: 'Tiles',
//						id:'layer0tiles',
//						layer:0,
//						leaf: true,
//						checked:true
//					},{
//						text: 'Walls',
//						id:'layer0walls',
//						layer:0,
//						leaf: true,
//						checked:true
//					}]
//				}, {
//					text: 'Layer 2',
//					checked:true,
//					expanded:true,
//					id:'layer1',
//					layer:1,
//					children:[{
//						text: 'Tiles',
//						id:'layer1tiles',
//						layer:1,
//						leaf: true,
//						checked:true
//					},{
//						text: 'Walls',
//						id:'layer1walls',
//						layer:1,
//						leaf: true,
//						checked:true
//					}]
//				}]
//			}),
//			rootVisible: false
//		});
		this.visibleItems['layer0'] = true;
		this.visibleItems['layer0tiles'] = true;
		this.visibleItems['layer0walls'] = true;
		this.visibleItems['layer1'] = true;
		this.visibleItems['layer1tiles'] = true;
		this.visibleItems['layer1walls'] = true;
		
//		this.layerTree.on('click', function(n) {
//			//console.log('Navigation Tree Click', 'You clicked: "' + n.attributes.text + '"');
//			this.currentLayer = n.attributes.layer;
//			this.drawPreview();
//		}, this)
//		this.layerTree.on('checkchange', function(n, checked) {
//			//this.currentLayer = n.attributes.layer;
//			this.visibleItems[n.attributes.id] = checked;
//			this.drawPreview();
//		}, this);
		
		this.westPanel = new Ext.panel.Panel({
			region:'west',
//			items:[this.layerTree],
			items:[{
				title:'fake west'
			}],
			width:200
		});

		this.previewTab = new Ext.panel.Panel({
			title:'Preview Tab',
			layout:'border',
			items:[this.previewPanel, this.tileViewer, this.westPanel],
			tbar:[{
				text:'Save',
				scope:this,
				handler:this.saveMap
			}]
		});
		
		this.previewPanel.on('afterRender', function() {
			this.previewPanel.update('<div class="previewWrap"></div>');
			this.previewWrap = Ext.getBody().down('.previewWrap');
			this.previewCanvas = Ext.get(document.createElement('canvas'));
			this.previewWrap.appendChild(this.previewCanvas);
			this.previewContext = this.previewCanvas.dom.getContext('2d');
			this.previewWrap.on('click', this.onPreviewClick, this);
			this.previewTab.on('show', this.showPreview, this);
			this.showPreview();
		}, this);

		this.items.push(this.previewTab);
	},

	initCodeTab: function() {
		this.codeBox = new Ext.form.field.TextArea({
			flex:1
		});
		this.codeTab = new Ext.panel.Panel({
			title:'Code Tab',
			items:[this.codeBox],
			layout:'hbox',
			tbar:[{
				text:'Set Map',
				handler:this.setMap,
				scope:this
			}]
		});
		this.codeTab.on('show', this.buildCode, this);
		this.items.push(this.codeTab);
	},

	setMap: function() {
		this.mapSettings = Ext.decode(this.codeBox.getValue());
		this.settingsForm.getForm().setValues(this.mapSettings);
		this.setActiveTab(1);
	},

	showPreview: function() {
		var formValues = this.settingsForm.getForm().getValues();
		Ext.apply(this.mapSettings, formValues);

		// update canvas size
		var width = this.mapSettings.width * this.mapSettings.tileSize;
		var height = this.mapSettings.height * this.mapSettings.tileSize;
		this.previewCanvas.set({
			width:width,
			height:height
		});
		this.previewWrap.setStyle({
			width:width + 'px',
			height:height + 'px',
			border:'1px solid wheat'
		});

		// init tile array
		var oldData = this.mapSettings;
		this.mapSettings.tileData = [];
		for (var layerIndex = 0; layerIndex < this.mapSettings.numLayers; layerIndex++) {
			this.mapSettings.tileData[layerIndex] = oldData.tileData[layerIndex] || [];
			for (var rowIndex = 0; rowIndex < this.mapSettings.height; rowIndex++) {
				this.mapSettings.tileData[layerIndex][rowIndex] = oldData.tileData[layerIndex][rowIndex] || [];
				for (var columnIndex = 0; columnIndex < this.mapSettings.width; columnIndex++) {
					this.mapSettings.tileData[layerIndex][rowIndex][columnIndex] = oldData.tileData[layerIndex][rowIndex][columnIndex] || this.getBlankTile();
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
		this.previewContext.clearRect(0, 0, this.previewCanvas.dom.width, this.previewCanvas.dom.height);

		// loop through each layer
		for (var layerIndex = 0; layerIndex < this.mapSettings.numLayers && layerIndex <= this.currentLayer; layerIndex++) {

			// check if this layer is visible
			if (this.visibleItems['layer' + layerIndex]) {
				
				// check if we need to draw the tiles
				if (this.visibleItems['layer' + layerIndex + 'tiles']) {
					for (var rowIndex = 0; rowIndex < this.mapSettings.height; rowIndex++) {
						for (var columnIndex = 0; columnIndex < this.mapSettings.width; columnIndex++) {
							// draw the tile
							var tile = this.mapSettings.tileData[layerIndex][rowIndex][columnIndex];
							var tileIndex = tile.tileIndex;
							if (tileIndex) {
								this.previewContext.drawImage(this.map, tileIndex * this.mapSettings.tileSize, 0, this.mapSettings.tileSize, this.mapSettings.tileSize, columnIndex * this.mapSettings.tileSize, rowIndex * this.mapSettings.tileSize, this.mapSettings.tileSize, this.mapSettings.tileSize);
							}
						}
					}
				}

				// check if we need to draw the walls
				if (this.visibleItems['layer' + layerIndex + 'walls']) {
					for (var rowIndex = 0; rowIndex < this.mapSettings.height; rowIndex++) {
						for (var columnIndex = 0; columnIndex < this.mapSettings.width; columnIndex++) {
							var tile = this.mapSettings.tileData[layerIndex][rowIndex][columnIndex];
							var tileIndex = tile.tileIndex;
							if (tileIndex) {
								if (tile.isWall) {
									this.previewContext.fillStyle = "rgba(255, 255, 0, 0.75)";
									this.previewContext.fillRect(columnIndex * this.mapSettings.tileSize, rowIndex * this.mapSettings.tileSize, this.mapSettings.tileSize, this.mapSettings.tileSize);
								}
							}
						}
					}
				}
			}
		}
	},

	onPreviewClick: function(e) {
		var previewXY = this.previewWrap.getXY();
		var clickXY = [e.browserEvent.x, e.browserEvent.y];
		var clickedX = clickXY[0] - previewXY[0];
		var clickedY = clickXY[1] - previewXY[1];
		var tileXY = [Math.floor(clickedX / this.mapSettings.tileSize), Math.floor(clickedY / this.mapSettings.tileSize), this.currentLayer];

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

				for (var i = 0; i < selectionHeight; i++) {
					for (var j = 0; j < selectionWidth; j++) {
						this.selectTile([startCoord[0] + j, startCoord[1] + i, this.currentLayer]);
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
	},

	highlightTile: function(xy) {
		var tileHighlight = Ext.get(document.createElement('div'));
		tileHighlight.addCls('tileHighlight');
		tileHighlight.setStyle({
			width:this.mapSettings.tileSize + 'px',
			height:this.mapSettings.tileSize + 'px',
			left:(xy[0] * this.mapSettings.tileSize) + 'px',
			top:(xy[1] * this.mapSettings.tileSize) + 'px'
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
		var tileXY = [Math.floor(clickedX / this.mapSettings.tileSize), Math.floor(clickedY / this.mapSettings.tileSize)];
		var tileIndex = tileXY[0];
		
		// update the map grid
		for (var i = 0; i < this.selectedTiles.length; i++) {
			var x = this.selectedTiles[i][0];
			var y = this.selectedTiles[i][1];
			this.mapSettings.tileData[this.currentLayer][y][x].tileIndex = tileIndex;
		}
		
		this.drawPreview();
	},

	buildCode: function() {
		this.codeBox.setValue(Ext.encode(this.mapSettings));
	},

	setViewLayer: function(newLayer) {
		if (newLayer >= 0 && newLayer < this.mapSettings.numLayers) {
			this.currentLayer = newLayer;
			this.drawPreview();
		}
	},

	copySelected: function() {

	},

	pasteSelected: function() {

	},

	moveSelectedTo: function(newLayer) {
		if (newLayer >= 0 && newLayer < this.mapSettings.numLayers) {
			var numSelected = this.selectedTiles.length;
			for (var i = 0; i < numSelected; i++) {
				var tileCoords = this.selectedTiles[i];
				var tile = this.mapSettings.tileData[this.currentLayer][tileCoords[1]][tileCoords[0]];
				this.mapSettings.tileData[newLayer][tileCoords[1]][tileCoords[0]] = Ext.apply(this.getBlankTile(), tile);
				this.mapSettings.tileData[this.currentLayer][tileCoords[1]][tileCoords[0]] = this.getBlankTile();
			}
			this.currentLayer = newLayer;
			this.drawPreview();
		}
	},

	setAsWall: function() {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			var tile = this.selectedTiles[i];
			this.mapSettings.tileData[tile[2]][tile[1]][tile[0]].isWall = true;
		}
	},

	unsetWall: function() {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			var tile = this.selectedTiles[i];
			this.mapSettings.tileData[tile[2]][tile[1]][tile[0]].isWall = false;
		}
	},

	setTileProperties: function(properties) {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			var tile = this.selectedTiles[i];
			Ext.apply(this.mapSettings.tileData[tile[2]][tile[1]][tile[0]], properties);
		}
	},

	toggleWalls: function() {
		this.drawPreview();
	},
	
	saveMap: function() {
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:'/wes/process/save-map',
			params:{
				mapData:Ext.encode(this.mapSettings)
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				console.log(response);
			}
		});
	}
});