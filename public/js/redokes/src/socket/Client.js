Ext.define('Redokes.socket.Client', {
	extend: 'Ext.util.Observable',
	config:{
		url: '',
		port:8080,
		namespace:''
	},
	handlers: [],
	socket:false,
	
	constructor: function(config) {
        this.initConfig(config);
		this.addEvents('connect', 'disconnect', 'otherConnect', 'otherDisconnect');
		this.initSocket();
    },
	
	initSocket: function() {
		d('Init socket');
		var url = this.url;
		if (this.namespace.length) {
			url += '/' + this.namespace;
		}
		
		if (window.io == null) {
			this.socket = false;
			return false;
		}
		
		d('Connect socket ' + url);
		this.socket = io.connect(url);
		
		this.socket.on('connect', Ext.Function.bind(function() {
			d('connect event');
			this.fireEvent('connect', this, arguments);
		}, this));
		this.socket.on('disconnect', Ext.Function.bind(function() {
			this.fireEvent('disconnect', this, arguments);
		}, this));
		this.socket.on('otherConnect', Ext.Function.bind(function() {
			this.fireEvent('otherConnect', this, arguments);
		}, this));
		this.socket.on('otherDisconnect', Ext.Function.bind(function() {
			this.fireEvent('otherDisconnect', this, arguments);
		}, this));
		
	},
	
	disconnect: function() {
		d('Disconnect socket client ' + this.namespace);
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