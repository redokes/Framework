Ext.define('Modules.files.js.music.Playlist', {
	extend:'Ext.view.View',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	//config
	itemSelector: '.playlist-item',
	
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
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			fields: [
				'id',
				'content',
				'name',
				'size',
				'type',
				'remote',
				'node'
			]
		});
	},
	
	initTpl: function() {
		this.tpl = Ext.create('Ext.XTemplate', 
			'<tpl for=".">',
				'<div class="playlist-item">',
				  '<span>{name}</span>',
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
	},
	
	addFiles: function(records) {
		this.store.add(records);
	}
	
});