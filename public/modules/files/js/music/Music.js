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
		this.initPlaylist();
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
			scope: this
		}, this);
		this.getApplication().getNorth().add(this.player);
	},
	
	initPlaylist: function(){
		this.playlist = Ext.create('Modules.files.js.music.playlist.Playlist', {
			
		});
		this.getApplication().getCenter().add(new Ext.panel.Panel({
			layout: 'fit',
			title: 'Playlist',
			items:[this.playlist]
		}));
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
		this.playlist.on('itemdblclick', function(view, record, item, index, event){
			//Cancel the event
			event.preventDefault();
			event.stopEvent();
			
			var node = record.get('node');
			var nodeId = node.internalId;
			var file = node.raw.file;
			if(record.get('remote')){
				//Create the file request
				var fileRequest = {
					fileId: nodeId,
					userSocketId: user.socketId,
					socketId: user.getRemoteTree().remoteUserId,
					size: node.raw.file.size
				};
				var url = 'http://127.0.0.1:8080/file/' + encodeURI(Ext.encode(fileRequest));
				
				//Start playing the file
				this.player.setSrc(url);
				this.player.play();

				//Share this on the stream
				this.getApplication().onModuleReady('stream', function(stream){
					stream.addMessage({
						text: 'You are listening to ' + file.name 
					});
				}, this);
			}
			else{
				//download local file
				var file = Ext.create('Modules.files.js.file.File', node.raw.file);
				file.on('complete', function(file, content){
					this.player.setRawSrc(file.type, content);
					this.player.play();
					
					//Share this on the stream
					this.getApplication().onModuleReady('stream', function(stream){
						if(stream){
							stream.addMessage({
								text: 'You are listening to ' +  file.fileName
							});
						}
					}, this);
					
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
		return;
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