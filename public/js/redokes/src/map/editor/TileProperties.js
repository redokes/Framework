Ext.define('Redokes.map.editor.TileProperties', {
	extend:'Ext.form.Panel',
	
	title:'Tile Properties',
	
	initComponent: function() {
		this.items = this.items || [];
		this.initFields();
		this.callParent(arguments);
	},
	
	initFields: function() {
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
		
		this.loadMap = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Load Map',
			name:'loadMap'
		});
		this.loadMapCoords = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Load Map Coords',
			name:'loadMapCoords'
		});
		
		this.tileFormIsWall.on('change', function(checkbox, checked) {
			this.editor.setAsWall(checked);
		}, this);
		
		this.tileFormTeleport.on('change', function(textfield, value) {
			var parts = value.split(',');
			if (parts.length == 3) {
				this.editor.setTileAction('teleport', {
					x:parseInt(parts[0]),
					y:parseInt(parts[1]),
					layer:parseInt(parts[2])
				});
			}
			else {
				this.editor.removeTileAction('teleport');
			}
		}, this);
		
		this.loadMap.on('change', function(field, value) {
			if (value.length) {
				this.editor.setTileAction('loadMap', {
					title:value
				});
			}
			else {
				this.editor.removeTileAction('loadMap');
			}
		}, this);
		
		this.loadMapCoords.on('change', function(textfield, value) {
			var parts = value.split(',');
			if (parts.length == 3) {
				this.editor.setTileAction('loadMapCoords', {
					x:parseInt(parts[0]),
					y:parseInt(parts[1]),
					layer:parseInt(parts[2])
				});
			}
			else {
				this.editor.removeTileAction('loadMapCoords');
			}
		}, this);
		
		this.items.push([
			this.tileFormX,
			this.tileFormY,
			this.tileFormLayer,
			this.tileFormIsWall,
			this.tileFormTeleport,
			this.loadMap,
			this.loadMapCoords
		]);
	}
});