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
		this.initStream();
		this.initRemoteView();
		this.initList();
		this.initUserHandler();
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
		//Create the remote view to hold remote users files
		this.remoteView = Ext.create('Modules.files.js.user.view.User',{
			title: 'Remote User',
			remote: true
		});
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
		
		//Listen for when the user adds files
		this.onViewReady(function(){
			this.getView().on('select', function(field){
				var stream = this.application.getModule('stream');

				//Add to local stream
				stream.addMessage({
					text: 'You just added ' + field.getFiles().length + ' file(s)'
				});

				//Send a message to everyone else
				this.getApplication().getSocketClient().send(
					'user',
					'message',
					{ 
						message: 'Just added ' + field.getFiles().length + ' file(s)'
					}
				);
			}, this);
		}, this);
	},
	
	initList: function(){
		
		//Create the list to hold the users that are currently connected
		this.list = Ext.create('Modules.files.js.user.view.List', {
			scope: this
		});
		
		//Add a navigation panel to hold the list
		this.getApplication().getNavigation().add(new Ext.panel.Panel({
			scope: this,
			title: 'Users',
			layout: 'fit',
			items: [this.list]
		}));
		
		//Listen for when an item is clicked, and load the users shared files
		this.list.on('itemclick', function(view, record){
			this.loadUser(record);
		}, this);
		
	},
	
	initUserHandler: function(){
		//Get the current remote users
		this.getApplication().getSocketClient().socket.emit('getRemoteUsers', {}, Ext.bind(function(response){
			Ext.each(response.sockets, function(socket){
				this.list.store.add({
					name: socket.id,
					id: socket.id
				});
			}, this);
		}, this));
		
		//Listen for a new user connect
		this.getApplication().getSocketClient().socket.on('otherConnect', Ext.bind(function(user){
			
			//Add the user to the list store
			this.list.store.add({
				name: user.id,
				id: user.id
			});
			
			//Show a message to the stream
			this.getApplication().onModuleReady('stream', function(stream){
				stream.addMessage({
					text: user.id + ' Connected'
				});
			}, this);
			
		}, this));
		
		//Listen for a user disconnect
		this.getApplication().getSocketClient().socket.on('otherDisconnect', Ext.bind(function(id){
			//Find the record of the user
			var record = this.list.store.findRecord('id', id);
			this.list.store.remove(record);
			
			//Show a message to the stream
			this.getApplication().onModuleReady('stream', function(stream){
				stream.addMessage({
					text: record.get('name') + ' Disconnected'
				});
			}, this);
			
		}, this));
	},
	
	initFileHandler: function(){
		//Share the file list
		Ext.create('Redokes.socket.client.Handler', {
			scope: this,
			client: this.application.getSocketClient(),
			module: 'files',
			actions: {
				get: function(handler, response){
					//Return if no view yet
					if(!this.getView()){
						return;
					}
					
					//Send files to user who requested them
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
					this.remoteView.setTitle('Viewing ' + response.storeData.id + ' Files');
					this.remoteView.tree.loadRemoteUser(response.storeData.id , response.data.nodes);
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