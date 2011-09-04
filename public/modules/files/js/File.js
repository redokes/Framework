Ext.define('Modules.files.js.File', {
	extend:'Ext.util.Observable',
	id:false,
	fileSelector:false,
	store:false,
	
	constructor: function(options) {
		Ext.apply(this, options || {});
		this.callParent(arguments);
		this.init();
	},
	
	init: function() {
		this.initStore();
		this.initTree();
		this.initFileSelector();
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			
		});
	},
	
	initTree: function() {
		
	},
	
	initFileSelector: function() {
		if (this.id) {
			this.fileSelector = Ext.get(this.id);
			this.fileSelector.on('change', function(e) {
				var store = Ext.create('Ext.data.Store')
				var fileList = e.target.files;
				var numFiles = fileList.length;
				for (var i = 0; i < numFiles; i++) {
					
				}
			}, this);
		}
	}
	
});