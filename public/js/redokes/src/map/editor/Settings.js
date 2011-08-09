Ext.define('Redokes.map.editor.Settings', {
	extend:'Ext.form.Panel',
	
	title:'Map Settings',
	
	initComponent: function() {
		this.items = this.items || [];
		this.initFields();
		this.callParent(arguments);
	},
	
	initFields: function() {
		this.titleField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Title',
			name:'title',
			value:this.editor.mapSettings.title
		});
		
		this.fileField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'File',
			name:'fileName',
			value:this.editor.mapSettings.fileName
		});
		
		this.spawnXField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Spawn X',
			name:'spawnX',
			value:this.editor.mapSettings.spawnX
		});
		
		this.spawnYField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Spawn Y',
			name:'spawnY',
			value:this.editor.mapSettings.spawnY
		});
		
		this.spawnLayerField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Spawn Layer',
			name:'spawnLayer',
			value:this.editor.mapSettings.spawnLayer
		});
		
		this.numLayersField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'# Layers',
			name:'numLayers',
			value:this.editor.mapSettings.numLayers
		});
		
		this.widthField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Width',
			name:'width',
			value:this.editor.mapSettings.width
		});
		
		this.heightField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Height',
			name:'height',
			value:this.editor.mapSettings.height
		});
		
		this.tileSizeField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Tile Size',
			name:'tileSize',
			value:this.editor.mapSettings.tileSize
		});
		
		this.musicField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Music',
			name:'music',
			value:this.editor.mapSettings.music
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
	}
});