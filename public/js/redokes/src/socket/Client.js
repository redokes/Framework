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
		if (window.io == null) {
			this.socket = false;
			return false;
		}
		var url = this.url;
		if (this.namespace.length) {
			url += '/' + this.namespace;
		}
		this.socket = io.connect(url);
		
		this.socket.on('connect', Ext.Function.bind(function() {
			this.fireEvent('connect');
		}, this));
		this.socket.on('disconnect', Ext.Function.bind(function() {
			this.fireEvent('disconnect');
		}, this));
		this.socket.on('otherConnect', Ext.Function.bind(function() {
			this.fireEvent('otherConnect');
		}, this));
		this.socket.on('otherDisconnect', Ext.Function.bind(function() {
			this.fireEvent('otherDisconnect');
		}, this));
		
	},
	
	send: function(action, data) {
		this.socket.json.send({
    		action: action,
    		data: data
    	});
	}
});