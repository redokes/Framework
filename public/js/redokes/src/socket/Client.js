Ext.define('Redokes.socket.Client', {
	extend: 'Ext.util.Observable',
	config: {
		url: '',
		port: 8080,
		namespace: ''
	},
	socket: false,
	
	constructor: function(config) {
        this.initConfig(config);
		this.addEvents('connect', 'disconnect', 'otherConnect', 'otherDisconnect', 'userConnect', 'userDisconnect');
		this.initSocket();
    },
	
	initSocket: function() {
		var url = this.url;
		if (this.getNamespace().length) {
			url += '/' + this.namespace;
		}
		
		if (window.io == null) {
			this.socket = false;
			return false;
		}
		
		this.socket = io.connect(url);
		
		this.socket.on('connect', Ext.bind(function() {
			this.fireEvent('connect', this, arguments);
		}, this));
		this.socket.on('disconnect', Ext.bind(function() {
			this.fireEvent('disconnect', this, arguments);
		}, this));
		this.socket.on('otherConnect', Ext.bind(function() {
			this.fireEvent('otherConnect', this, arguments);
		}, this));
		this.socket.on('otherDisconnect', Ext.bind(function() {
			this.fireEvent('otherDisconnect', this, arguments);
		}, this));
		this.socket.on('userConnect', Ext.bind(function() {
			this.fireEvent('userConnect', this, arguments);
		}, this));
		this.socket.on('userDisconnect', Ext.bind(function() {
			this.fireEvent('userDisconnect', this, arguments);
		}, this));
		
	},
	
	disconnect: function() {
		this.socket.disconnect();
//		delete this.socket;
	},
	
	send: function(action, data) {
		this.socket.json.send({
    		action: action,
    		data: data
    	});
	}
});