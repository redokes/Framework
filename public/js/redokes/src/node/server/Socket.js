Ext.define('Redokes.node.server.Socket', {
	extend: 'Ext.util.Observable',
	requires: [
		'Redokes.node.server.Namespace'
	],
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	socketio: require('socket.io'),
	io:false,
	httpServer: null,
	
	/**
	 * Init socket io by telling it the http server
	 */
	constructor: function(httpServer) {
		this.httpServer = httpServer;
		this.io = this.socketio.listen(this.httpServer);
		this.io.set('log level', 1);
		this.createNamespace('');
	},
	
	/**
	 * Creates a new namespace if it doesn't already exist
	 * @param {String} name
	 */
	createNamespace: function(name) {
		this.log('Check to create namespace ' + name);
		if (!this.io.sockets.manager.namespaces['/' + name]) {
			this.log('Create namespace ' + name);
			Ext.create('Redokes.node.server.Namespace', {
				name: name,
				io: this.io,
				socket: this
			});
		}
	}
	
});