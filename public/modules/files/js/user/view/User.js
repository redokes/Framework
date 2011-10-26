Ext.define('Modules.files.js.user.view.User', {
	extend: 'Ext.panel.Panel',
	
	//Config
	layout: 'border',

    initComponent: function() {
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initTree();
		this.initFolderSelect();
	},
	
	initTree: function(){
		this.tree = Ext.create('Modules.files.js.user.view.Tree', {
			scope: this,
			region: 'center'
		});
		this.items.push(this.tree);
	},
	
	initFolderSelect: function(){
		this.folderSelect = Ext.create('Modules.files.js.form.field.Folder', {
			scope: this,
			width: 60
		});
		
		//Chain events
		//this.fireEvent('select', this, this.fileInputEl, e);
		this.folderSelect.on('select', function(field, inputEl, event, options){
			this.fireEvent('select', field, inputEl, event);
		}, this);
		this.tree.toolbar.add('->', this.folderSelect);
	}
	
});