Ext.define('Redokes.node.server.Http', {
	extend: 'Ext.util.Observable',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	http: require('http'),
	fs: require('fs'),
	qs: require('querystring'),
	utils: require('util'),
	httpServer: null,
	
	config: {
		port: 8080
	},
	
	constructor: function(config) {
		this.initConfig(config);
		this.initHttpServer();
		return this.callParent(arguments);
	},
	
	initHttpServer: function() {
		this.httpServer = this.http.createServer(function(request, response) {
			var requestObject = require('url').parse(request.url, true);
			var path = requestObject.pathname.replace(/^\//, "").replace(/\/$/, "");
			var parts = path.split('/');
			
			//Total Rig for now
			if(parts[0] == 'file'){
				console.log('------File-------');
				console.log(request.headers);
			}

			//Handle the post params
			if (request.method == 'POST') {
				var body = '';
				request.on('data', function(data) {
					body += data;
				}.bind(this));
				request.on('end', function() {
					var post = this.qs.parse(body.replace( /\+/g, ' ' ));
					this.onRequest(request, response, path, post);
				}.bind(this));
			}
			else{
				this.onRequest(request, response, path, {});
			}
		}.bind(this));
		this.httpServer.listen(this.port);
	},
	
	onRequest: function(request, response, path, data){
		console.log('on request');
		this.fireEvent('request', request, response, path, data);
	}
});