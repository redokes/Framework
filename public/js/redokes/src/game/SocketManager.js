Ext.define('Redokes.game.SocketManager', {
	extend: 'Ext.util.Observable',
	config:{
		url: '',
		port:8080,
		timeout: 3000,
		data: {},
		game:false
	},
	
	constructor: function(config) {
		if(config.data != null){
			Ext.apply(config.data, this.config.data);
		}
		d('Socket Manager Construct');
        this.initConfig(config);
        this.initClient();
        this.initClientHandler();
        this.initServerHandler();
		this.initPlayerHandler();
		this.client.connect();
        return this;
    },
    
    initClient: function(){
    	this.client = Ext.create('Redokes.socket.Client', {
			url: this.url,
			data: this.data,
			port:8080
		});
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
			module:'player',
			actions:{
				move: Ext.bind(function(request) {
					this.game.players[request.session].updateRemotePlayer(request.data);
				}, this)
			}
		});
    	this.client.registerHandler(this.playerHandler);
    }
});