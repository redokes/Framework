Ext.define('Redokes.socket.SocketManager', {
	extend: 'Ext.util.Observable',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	config:{
		url: '',
		timeout: 3000,
		game:false,
		namespaces:{}
	},
	
	constructor: function(config) {
		this.addEvents('initclient');
		this.namespaces = {};
        this.initConfig(config);
//		this.createNamespace('');
		window.sockets = this;
    },
	
	createNamespace: function(name) {
		if (!this.namespaces[name]) {
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
		this.log('Init cient ' + name);
		this.namespaces[name] = Ext.create('Redokes.socket.Client', {
			url:this.url,
			namespace:name
		});
		this.log('Made it here');
		this.fireEvent('initclient', this.namespaces[name]);
		this.log('fired');
	},
	
	removeNamespace: function(name) {
		if (this.namespaces[name]) {
			this.namespaces[name].disconnect();
//			delete this.namespaces[name];
		}
	}
});