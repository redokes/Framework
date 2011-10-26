Ext.define('Modules.files.js.music.Music', {
	extend: 'Modules.files.js.module.Module',
	singleton: true,
	
	//Config
	config:{
		name: 'music',
		title: 'Playlist'
	},
	downloadedFiles: {},
	storedFiles: {},
	
	//Init Functions
	init: function(){
		this.initStore();
		this.initPlayer();
		this.initFileHandler();
		this.initTree();
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.Store', {
			scope: this,
			fields:[
				'id',
				'content'
			],
			proxy: {
				type: 'localstorage',
				id  : 'music-files'
			}
		});
		this.store.load();
	},
	
	initPlayer: function(){
		this.player = Ext.create('Modules.files.js.music.Player', {
			scope: this,
			dock: 'right'
		}, this);
		
		this.getApplication().getEast().add(this.player);
		
		//this.application.getAccordion().add(this.player);
		//this.audio = document.createElement('audio');
		//document.body.appendChild(this.audio);
		//audio.src = 'data:' + this.file.type + ';base64,' + window.btoa(this.chunks.join(''));
		//audio.play();
	},
	
	initTree: function(){
		var user = this.application.getModule('user');
		if(!user){
			this.application.onModuleReady('user', function(user){
				this.initTree();
			}, this);
			return;
		}
		
		//Download the file from the remote user
		this.player.playlist.on('itemdblclick', function(view, record, item, index){
			var node = record.get('node');
			console.log(node);
			if(record.get('remote')){
				this.getApplication().getSocketClient().send(
					'file',
					'get',
					{ 
						socketId:  this.remoteUserId,
						nodeId: node.internalId
					}
				);
			}
			else{
				//download local file
				var file = Ext.create('Modules.files.js.file.File', node.raw.file);
				file.on('complete', function(file, content){
					this.player.setRawSrc(file.type, content);
					this.player.play();
				}, this);
				file.download();
			}
		}, this);
		
		return;
		
		user.getTree().on('itemdblclick', function(view, record, item, index){
			console.log(record.raw.file);
			
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
	
	initFileHandler: function(){
		
		//Share a file
		Ext.create('Redokes.socket.client.Handler', {
			scope: this,
			client: this.application.getSocketClient(),
			module: 'file',
			actions: {
				chunk: function(handler, response){
					var nodeId = response.data.nodeId;
					if(this.downloadedFiles[nodeId] == null){
						this.downloadedFiles[nodeId] = Ext.apply(response.data.file, {
							content: []
						});
					}
					this.downloadedFiles[nodeId].content.push(response.data.chunk);
				},
				
				complete: function(handler, response){
					var nodeId = response.data.nodeId;
					var file = this.downloadedFiles[nodeId];
					var content = this.downloadedFiles[nodeId].content.join('');
					
					//Start playing the file
					this.player.setRawSrc(file.type, content);
					this.player.play();

					//Share this on the stream
					this.getApplication().onModuleReady('stream', function(stream){
						stream.addMessage({
							text: 'You are listening to ' + file.name 
						});
					}, this);
				}
			}
		});
	}
});