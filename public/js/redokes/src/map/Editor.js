Ext.define('Redokes.map.Editor', {
	extend:'Ext.tab.Panel',
	
	activeTab:0,
	blankTile:{
		tileIndex:false,
		isWall:false
	},
	mapSettings:{
		title:'Map',
		fileName:'Default',
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

	initComponent: function() {
		this.items = [];
		this.initSettingsForm();
		this.initPreviewTab();
		this.loadMap();

		this.callParent(arguments);
	},

	loadMap: function() {
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:'/wes/process/load-map',
			params:{
				fileName:this.fileField.getValue()
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.contents) {
					eval(response.contents);
					
					// make a map data instance to read the data from it
					var mapData = Ext.create(response.cls);
					mapData.fileName = response.fileName;
					var params = {};
					this.mapSettings.fileName = response.fileName;
					this.mapSettings.tileData = mapData.tileData;
					for (var i in this.mapSettings) {
						params[i] = mapData[i];
					}
					this.settingsForm.getForm().setValues(params);
					Ext.apply(this.mapSettings, params);
					
					this.map = new Image();
					this.map.onload = Ext.Function.bind(function() {
						this.showPreview();
					}, this);
					this.map.src = this.mapSettings.tileSheet;
					
					// Load the map in the actual game
					this.game.map.loadMap(this.fileField.getValue());
				}
			}
		});
	},

	initSettingsForm: function() {
		this.titleField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Title',
			name:'title',
			value:this.mapSettings.title
		});
		
		this.fileField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'File',
			name:'fileName',
			value:this.mapSettings.fileName
		});
		
		this.spawnXField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Spawn X',
			name:'spawnX',
			value:this.mapSettings.spawnX
		});
		
		this.spawnYField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Spawn Y',
			name:'spawnY',
			value:this.mapSettings.spawnY
		});
		
		this.spawnLayerField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Spawn Layer',
			name:'spawnLayer',
			value:this.mapSettings.spawnLayer
		});
		
		this.numLayersField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'# Layers',
			name:'numLayers',
			value:this.mapSettings.numLayers
		});
		
		this.widthField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Width',
			name:'width',
			value:this.mapSettings.width
		});
		
		this.heightField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Height',
			name:'height',
			value:this.mapSettings.height
		});
		
		this.tileSizeField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Tile Size',
			name:'tileSize',
			value:this.mapSettings.tileSize
		});
		
		this.musicField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Music',
			name:'music',
			value:this.mapSettings.music
		});
		
		
		this.settingsForm = Ext.create('Ext.form.Panel', {
			title:'Map Settings',
			collapsible:true,
			items:[
				this.titleField,
				this.fileField,
				this.spawnXField,
				this.spawnYField,
				this.spawnLayerField,
				this.numLayersField,
				this.widthField,
				this.heightField,
				this.tileSizeField
			]
		});
	},

	initPreviewTab: function() {
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
			this.tileViewerWrap.update('<img src="'+this.mapSettings.tileSheet+'" />');
			this.tileViewerWrap.on('click', this.tileViewerClick, this);
			this.tileViewer.setHeight(parseInt(this.mapSettings.tileSize) + 20);
			//this.tileViewer.update('really long text really long text really long text really long text really long text really long text really long text really long text really long text ');
		}, this);
		
		this.layerTree = Ext.create('Ext.tree.Panel', {
			title:'Layer Visibility',
			collapsible:true,
			rootVisible:false,
			root:{
				expanded: true,
				children: [{
					text: 'Layer 1',
					checked:true,
					expanded:true,
					id:'layer-0',
					children:[{
						text: 'Tiles',
						id:'tiles-0',
						leaf: true,
						checked:true
					},{
						text: 'Walls',
						id:'walls-0',
						leaf: true,
						checked:true
					}]
				}, {
					text: 'Layer 2',
					checked:true,
					expanded:true,
					id:'layer-1',
					children:[{
						text: 'Tiles',
						id:'tiles-1',
						leaf: true,
						checked:true
					},{
						text: 'Walls',
						id:'walls-1',
						leaf: true,
						checked:true
					}]
				}]
			}
		});
		
		this.layerTreeStore = this.layerTree.getStore();
		this.layerTree.on('itemclick', function(view, record, item, index, e, options) {
			var clickedLayer = record.data.id.split('-')[1];
			this.currentLayer = clickedLayer;
			this.drawPreview();
		}, this)
		this.layerTree.on('checkchange', function(node, checked) {
			this.drawPreview();
		}, this);
		
		this.tileFormX = Ext.create('Ext.form.field.Text', {
			fieldLabel:'X',
			name:'x',
			readOnly:true
		});
		this.tileFormY = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Y',
			name:'y',
			readOnly:true
		});
		this.tileFormLayer = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Layer',
			name:'layer',
			readOnly:true
		});
		this.tileFormIsWall = Ext.create('Ext.form.field.Checkbox', {
			fieldLabel:'Is Wall',
			name:'isWall'
		});
		this.tileFormTeleport = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Teleport',
			name:'teleport'
		});
		this.tileFormIsWall.on('change', function(checkbox, checked) {
			this.setAsWall(checked);
		}, this);
		this.tileFormTeleport.on('change', function(textfield, value) {
			var parts = value.split(',');
			if (parts.length == 3) {
				this.setAsTeleport({
					x:parseInt(parts[0]),
					y:parseInt(parts[1]),
					layer:parseInt(parts[2])
				});
			}
		}, this);
		
		this.tilePropertiesForm = Ext.create('Ext.form.Panel', {
			title:'Tile Properties',
			collapsible:true,
			items:[
				this.tileFormX,
				this.tileFormY,
				this.tileFormLayer,
				this.tileFormIsWall,
				this.tileFormTeleport,
			]
		});
		
		this.westPanel = new Ext.panel.Panel({
			region:'west',
			items:[
				this.settingsForm,
				this.layerTree,
				this.tilePropertiesForm
			],
			width:200,
			collapsible:true
		});

		this.previewTab = new Ext.panel.Panel({
			title:'Editor',
			layout:'border',
			items:[this.previewPanel, this.tileViewer, this.westPanel],
			tbar:[{
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
		}, this);

		this.items.push(this.previewTab);
	},

	showPreview: function() {
		d('Show Preview');
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
		for (var layerIndex = 0; layerIndex < this.mapSettings.numLayers; layerIndex++) {
			this.mapSettings.tileData[layerIndex] = this.mapSettings.tileData[layerIndex] || [];
			
			for (var rowIndex = 0; rowIndex < this.mapSettings.height; rowIndex++) {
				this.mapSettings.tileData[layerIndex][rowIndex] = this.mapSettings.tileData[layerIndex][rowIndex] || [];
				
				for (var columnIndex = 0; columnIndex < this.mapSettings.width; columnIndex++) {
					this.mapSettings.tileData[layerIndex][rowIndex][columnIndex] = this.mapSettings.tileData[layerIndex][rowIndex][columnIndex] || this.getBlankTile();
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
		for (var layerIndex = 0; layerIndex < this.mapSettings.numLayers && layerIndex <= this.currentLayer; layerIndex++) {

			// check if this layer is visible
			if (this.layerTreeStore.getNodeById('layer-' + layerIndex).data.checked) {
				
				// check if we need to draw the tiles
				if (this.layerTreeStore.getNodeById('tiles-' + layerIndex).data.checked) {
					
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
				if (this.layerTreeStore.getNodeById('walls-' + layerIndex).data.checked) {
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
		this.updateTilePropertiesForm();
	},
	
	updateTilePropertiesForm: function() {
		if (this.selectedTiles.length == 1) {
			var tile = this.selectedTiles[0];
			var tileData = this.mapSettings.tileData[tile[2]][tile[1]][tile[0]];
			var params = {
				x:tile[0],
				y:tile[1],
				layer:tile[2]
			};
			Ext.apply(params, tileData);
			this.tileFormIsWall.suspendEvents();
			
			// loop through actions
			var actions = tileData.actions || [];
			params.teleport = '';
			for (var i = 0; i < actions.length; i++) {
				if (actions[i].action == 'teleport') {
					params.teleport = actions[i].params.x + ',' + actions[i].params.y + ',' + actions[i].params.layer
				}
			}
			
			this.tilePropertiesForm.getForm().setValues(params);
			
			this.tileFormIsWall.resumeEvents();
		}
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
		d('Tile Viewer Click');
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

	setViewLayer: function(newLayer) {
		d('Set View Layer ' + newLayer);
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
		d('Move Selected To ' + newLayer);
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

	setAsWall: function(isWall) {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			var tile = this.selectedTiles[i];
			this.mapSettings.tileData[tile[2]][tile[1]][tile[0]].isWall = isWall;
		}
		this.drawPreview();
	},

	setAsTeleport: function(params) {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			var tile = this.selectedTiles[i];
			this.mapSettings.tileData[tile[2]][tile[1]][tile[0]].actions = [{
				action:'teleport',
				params:params
			}];
		}
		this.drawPreview();
	},

	setTileProperties: function(properties) {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			var tile = this.selectedTiles[i];
			Ext.apply(this.mapSettings.tileData[tile[2]][tile[1]][tile[0]], properties);
		}
	},
	
	clearSelectedTiles: function() {
		var numSelected = this.selectedTiles.length;
		for (var i = 0; i < numSelected; i++) {
			var tile = this.selectedTiles[i];
			this.mapSettings.tileData[tile[2]][tile[1]][tile[0]].tileIndex = false;
		}
		this.drawPreview();
	},

	toggleWalls: function() {
		d('Toggle Walls');
		this.drawPreview();
	},
	
	saveMap: function() {
		this.removeExtraTileData();
		
		var params = this.mapSettings;
		Ext.apply(params, this.settingsForm.getForm().getValues());
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:'/wes/process/save-map',
			params:{
				mapData:Ext.encode(params)
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				d(response);
			}
		});
	},
	
	updateMapSettings: function() {
		Ext.apply(this.mapSettings, this.settingsForm.getForm().getValues());
		this.showPreview();
	},
	
	removeExtraTileData: function() {
		// loop through and actually remove the extra tile data
		d(this.mapSettings.width);
		d(this.mapSettings.tileData[0][0].length);
		for (var layerIndex = 0; layerIndex < this.mapSettings.tileData.length; layerIndex++) {
			// trim the layer's rows
			this.mapSettings.tileData[layerIndex].splice(this.mapSettings.height, this.mapSettings.height);
			
			for (var rowIndex = 0; rowIndex < this.mapSettings.tileData[layerIndex].length; rowIndex++) {
				// trim the row's columns
				this.mapSettings.tileData[layerIndex][rowIndex].splice(this.mapSettings.width, this.mapSettings.width);
			}
		}
		d(this.mapSettings.width);
		d(this.mapSettings.tileData[0][0].length);
	}
	
});