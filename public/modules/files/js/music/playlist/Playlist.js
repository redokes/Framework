Ext.define('Modules.files.js.music.playlist.Playlist', {
	extend:'Ext.view.View',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	requires:[
		'Modules.files.js.model.Audio'
	],
	
	//config
	itemSelector: '.view-item',
	emptyText: '<div class="playlist-empty-text">Drop files here....</div>',
	deferEmptyText: false,
	overItemCls: 'view-hover',
	trackOver: true,
	autoScroll: true,
	
	initComponent: function(){
		this.showLog();
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initTpl();
		this.initListeners();
		this.initDragDrop();
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			model: 'Modules.files.js.model.Audio'
		});
	},
	
	initTpl: function() {
		this.tpl = Ext.create('Ext.XTemplate', 
			'<tpl for=".">',
				'<div class="view-item x-unselectable">',
				  '<span>{artist} - {title}</span>',
				'</div>',
			'</tpl>'
		);
	},
	
	initListeners: function(){
		this.on('itemdblclick', function(view, record, item, index){
			return;
			
			var file = Ext.create('Modules.files.js.file.File', record.raw.file);
			file.on('complete', function(file, data){
				this.player.setRawSrc(file.type, data);
				this.player.play();
				
				//Share this on the stream
				var stream = this.application.getModule('stream');
				if(stream){
					stream.addMessage({
						text: 'You are listening to ' + file.fileName
					});
				}
				
			}, this);
			file.download();
		}, this);
		
		this.on('afterrender', function(){
			this.refresh();
		}, this);
		
		this.on('refresh', function(){
			Ext.each(this.store.data.items, function(record){
				Ext.create('Modules.files.js.music.playlist.Item', this, record);
			}, this);
		}, this);
	},
	
	initDragDrop: function() {
		if (!this.rendered) {
			this.on('afterrender', this.initDragDrop, this);
			return;
		}
		this.dragDrop = Ext.create('Ext.dd.DropTarget', this.getEl(), {
			ddGroup: 'TreeDD',
			notifyOver: function() {
				return this.dropAllowed;
			},
			notifyDrop: Ext.bind(function(source, e, data) {
				var files = this.getDroppedFiles(data.records);
				this.addFiles(files);
			}, this)
		});
	},
	
	getDroppedFiles: function(records) {
		var files = [];
		for (var i = 0; i < records.length; i++) {
			if (records[i].childNodes && records[i].childNodes.length) {
				// Combine files with current file list
				var newFiles = this.getDroppedFiles(records[i].childNodes)
				var numFiles = newFiles.length;
				for (var j = 0; j < numFiles; j++) {
					files.push(newFiles[j]);
				}
			}
			else {
				files.push(records[i].raw.record);
			}
		}
		
		return files;
	},
	
	addFiles: function(records) {
		this.store.add(records);
	}
	
});