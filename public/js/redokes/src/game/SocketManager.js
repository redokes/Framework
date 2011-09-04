Ext.define('Redokes.game.SocketManager', {
	extend: 'Ext.util.Observable',
	config:{
		url: '',
		timeout: 3000,
		game:false,
		namespaces:{}
	},
	
	constructor: function(config) {
		d('Socket Manager Construct');
		this.addEvents('initclient');
		this.namespaces = {};
        this.initConfig(config);
		window.sockets = this;
    },
	
	createNamespace: function(name) {
		if (!this.namespaces[name]) {
			d('Create namespace ' + name);
			if (name.length) {
				this.namespaces[''].socket.emit('makeNamespace', {
					name:name
				}, Ext.Function.bind(function(params) {
					this.initClient(params.name);
				}, this));
			}
			else {
				// This is the global namespace
				this.initClient(name);
			}
		}
	},
	
	initClient: function(name) {
		d('Init client for namespace ' + name);
		this.namespaces[name] = Ext.create('Redokes.socket.Client', {
			url:this.url,
			namespace:name
		});
		this.fireEvent('initclient', this.namespaces[name]);
	},
	
	removeNamespace: function(name) {
		if (this.namespaces[name]) {
			d('Remove namespace ' + name);
			this.namespaces[name].disconnect();
//			delete this.namespaces[name];
		}
	},
    
    initClientHandler: function(){
    	this.clientHandler = Ext.create('Redokes.socket.MessageHandler', {
			module:'client',
			actions:{
				connect: Ext.bind(function(request) {
					this.game.initRemotePlayer(request);
				}, this),

				disconnect: Ext.bind(function(request) {
					this.game.removeRemotePlayer(request);
				}, this),

				update: Ext.bind(function(request) {
					this.game.updateRemotePlayer(request);
				}, this)
			}
		});
    	this.client.registerHandler(this.clientHandler);
    },
    
    initServerHandler: function(){
    	this.serverHandler = Ext.create('Redokes.socket.MessageHandler', {
			module:'server',
			actions:{
				init: Ext.bind(function(request) {
					this.game.initRemotePlayers(request);
				}, this)
			}
		});
    	this.client.registerHandler(this.serverHandler);
    },
	
	initPlayerHandler: function(){
		this.playerHandler = Ext.create('Redokes.socket.MessageHandler', {
			module:this.instanceName,
			actions:{
				move: Ext.bind(function(request) {
					this.game.players[request.session].updateRemotePlayer(request.data);
				}, this)
			}
		});
    	this.client.registerHandler(this.playerHandler);
    }
});