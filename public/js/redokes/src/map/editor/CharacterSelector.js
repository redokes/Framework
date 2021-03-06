Ext.define('Redokes.map.editor.CharacterSelector', {
	extend:'Ext.form.field.ComboBox',
	processingPage: '/wes/map-process/',
	
	queryMode:'local',
	displayField:'title',
	valueField:'fileName',
	editable:false,
	
	initComponent: function() {
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.store = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['fileName', 'title'],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-character-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
	}
	
});