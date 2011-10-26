Ext.define('Modules.files.js.user.User', {
	extend: 'Modules.files.js.module.Module',
	singleton: true,
	
	//Config
	config:{
		name: 'user',
		title: 'Users',
		navigationTitle: 'My Files',
		viewClass: 'Modules.files.js.user.view.User',
		isSubNavigationItem: true,
		subNavigationModules:[
			'stream'
		]
	},
	downloadedFiles: {},
	
	//Init Functions
	init: function(){
		//this.initStore();
		//this.initUser();
		//this.initMenu();
		//this.initMenuItem();
		//this.initView();
		//this.initStream();
		this.initRemoteView();
		this.initList();
		this.initFileHandler();
		this.onViewReady(this.initViewListeners, this);
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.Store', {
			scope: this,
			fields:[
				'name'
			],
			proxy: {
				type: 'localstorage',
				id  : 'files-users'
			}
		});
		this.store.load();
	},
	
	initUser: function(){
		var record = this.store.getAt(0);
		if(record == null){
			record = this.store.add({
				name: 'New User'
			});
			this.store.sync();
		}
		
		this.application.getSocketClient().socket.emit('setData', {
			user: record.data
		});
	},
	
	initView: function(){
		return this.callParent(arguments);
		this.view = Ext.create('Modules.files.js.user.view.User', {
			scope: this,
			title: 'User',
			application: this.application,
			module: this
		});
		this.application.getCenter().add(this.view);
		
		this.menu.folder.on('select', function(){
			this.view.tree.addFileList(this.menu.folder.getFiles());
		}, this);
		
		window.tree = this.view.tree;
	},
	
	initRemoteView: function(){
		this.remoteView = Ext.create('Modules.files.js.user.view.User');
		this.getApplication().getCenter().add(this.remoteView);
		
		//Download the file from the remote user
		this.remoteView.tree.on('download', function(tree, record){
			this.getApplication().getSocketClient().send(
				'file',
				'get',
				{ 
					socketId:  this.remoteUserId,
					nodeId: record.internalId
				}
			);
		}, this);
	},
	
	initViewListeners: function(){
		this.getView().on('select', function(field){
			this.getView().tree.addFileList(field.getFiles());
		}, this);
	},
	
	initStream: function(){
		var stream = this.application.getModule('stream');
		if(!stream){
			this.appication.onModuleReady('stream', function(){
				this.initStream();
			}, this);
			return;
		}
		
		this.menu.folder.on('select', function(){
			var stream = this.application.getModule('stream');
			stream.addMessage({
				text: 'You just added ' + this.menu.folder.getFiles().length + ' file(s)'
			});
		}, this);
	},
	
	initList: function(){
		this.list = Ext.create('Modules.files.js.user.view.List', {
			scope: this,
			application: this.application,
			module: this
		});
		this.getApplication().getNavigation().add(new Ext.panel.Panel({
			scope: this,
			title: 'Users',
			layout: 'fit',
			frame: true,
			margin: 2,
			items: [this.list]
		}));
		
		this.list.on('itemclick', function(view, record){
			this.loadUser(record);
		}, this);
	},
	
	initFileHandler: function(){
		//Share the file list
		Ext.create('Redokes.socket.client.Handler', {
			scope: this,
			client: this.application.getSocketClient(),
			module: 'files',
			actions: {
				get: function(handler, response){
					this.getApplication().getSocketClient().send(
						'files',
						'receive',
						{ 
							socketId:  response.socketId,
							nodes: this.getView().tree.convertToObject()
						}
					);
				},
				receive: function(handler, response){
					this.getApplication().setActive(this.remoteView);
					this.remoteView.tree.loadRemoteUser(response.data.socketId, response.data.nodes);
				}
			}
		});
		
		//Share a file
		Ext.create('Redokes.socket.client.Handler', {
			scope: this,
			client: this.application.getSocketClient(),
			module: 'file',
			actions: {
				get: function(handler, response){
					//Get the file
					var nodeId = response.data.nodeId;
					var file = Ext.create('Modules.files.js.file.File', this.getTree().getStore().getNodeById(nodeId).raw.file);
					file.on('chunk', function(event, data, options){
						this.getApplication().getSocketClient().send(
							'file',
							'chunk',
							{ 
								socketId: response.socketId,
								chunk: data,
								nodeId: nodeId
							}
						);
					}, this);
					file.on('complete', function(){
						this.getApplication().getSocketClient().send(
							'file',
							'complete',
							{ 
								socketId: response.socketId,
								nodeId: nodeId
							}
						);
					}, this);
					file.download();
				},
				chunk: function(handler, response){
					var nodeId = response.data.nodeId;
					if(this.downloadedFiles[nodeId] == null){
						this.downloadedFiles[nodeId] = [];
					}
					this.downloadedFiles[nodeId].push(response.data.chunk);
					console.log('got chunk');
				},
				
				complete: function(handler, response){
					console.log('file complete');
					var nodeId = response.data.nodeId;
					var audio = document.createElement('audio');
					document.body.appendChild(audio);
					audio.src = 'data:audio/mp3;base64,' + window.btoa(this.downloadedFiles[nodeId].join(''));
					//audio.play();
					window.webkitRequestFileSystem(
					  TEMPORARY,        // persistent vs. temporary storage
					  1024 * 1024,      // size (bytes) of needed space
					  function(){
						  console.log('init');
					  },           // success callback
					  function(){
						  console.log('error');
					  }  // opt. error callback, denial of access
					);
				}
			}
		});
	},
	
	//Functions
	loadUser: function(record){
		this.application.getSocketClient().send(
			'files',
			'get',
			{ 
				socketId:  record.get('id')
			}
		);
	},
	
	//Helper functions
	getTree: function(){
		return this.view.tree;
	}
});