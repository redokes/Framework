var Modules = {
	Server: "server",
	Client: "client"
};

var Actions = {
	Init: "init",
	Connect: "connect",
	Disconnect: "disconnect",
	Update: "update"
};


//Ext.define({String} className, {Object} members, {Function} onClassCreated);
Ext.define('Redokes.socket.Client', {
	extend: 'Ext.util.Observable',
	config:{
		url: '',
		server:false,
		port:8080,
		timeout: 3000,
		data:{}
	},
	handlers: [],
	
	constructor: function(config) {
        this.initConfig(config);
        this.addEvents('connect', 'message', 'disconnect');
		this.initSocket();
		this.initListeners();
        return this;
    },
	
	connect: function(){
		if (this.socket) {
			this.socket.connect();
		}
	},
    
    initSocket: function() {
		if (window.io == null) {
			this.socket = false;
			return false;
		}
		this.socket = new io.Socket(this.url, {
			port:this.port,
			connectTimeout: this.timeout
		});
	},
	
	initListeners: function() {
		if (this.socket) {
			this.socket.on('connect', Ext.Function.bind(function(){
				this.fireEvent('connect', arguments);
				
				this.send(
					Modules.Client,
					Actions.Update,
					this.data
				);
				
			}, this));
			
			this.socket.on('message', Ext.Function.bind(function(request){
				var params = {
					module:request.module,
					action:request.action
				};
				this.fireEvent('message', params);
				
				if (this.handlers[request.module]) {
					this.handlers[request.module].callAction(request.action, request);
				}
				
			}, this));
			
			this.socket.on('disconnect', Ext.Function.bind(function(client){
				this.fireEvent('disconnect', arguments);
			}, this));
		}
	},
	
	registerHandler: function(handler){
		this.handlers[handler.module] = handler;
	},
	
	send: function(module, action, data) {
		this.socket.send({
    		module: module,
    		action: action,
    		data: data
    	});
	}
});