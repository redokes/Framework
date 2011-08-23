Ext.define('Redokes.map.editor.Settings', {
	extend:'Ext.form.Panel',
	
	title:'Map Settings',
	editor:false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.initFields();
		this.initListeners();
		this.callParent(arguments);
	},
	
	initFields: function() {
		this.titleField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Title',
			name:'title'
		});
		
		this.fileField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'File',
			name:'fileName'
		});
		
		this.spawnXField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Spawn X',
			name:'spawnX'
		});
		
		this.spawnYField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Spawn Y',
			name:'spawnY'
		});
		
		this.spawnLayerField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Spawn Layer',
			name:'spawnLayer'
		});
		
		this.numLayersField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'# Layers',
			name:'numLayers'
		});
		
		this.widthField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Width',
			name:'width'
		});
		
		this.heightField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Height',
			name:'height'
		});
		
		this.tileSizeField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Tile Size',
			name:'tileSize'
		});
		
		this.musicField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Music',
			name:'music'
		});
		
		this.items.push([
			this.titleField,
			this.fileField,
			this.spawnXField,
			this.spawnYField,
			this.spawnLayerField,
			this.numLayersField,
			this.widthField,
			this.heightField,
			this.tileSizeField,
			this.musicField
		]);
	},
	
	initListeners: function() {
		this.widthField.on('blur', function(field) {
			this.editor.updateMapSize();
		}, this);
		
		this.heightField.on('blur', function(field) {
			this.editor.updateMapSize();
		}, this);
		
	}
});