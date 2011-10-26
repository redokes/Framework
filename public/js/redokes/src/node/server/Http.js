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
	},
	
	initHttpServer: function() {
		this.httpServer = this.http.createServer(function(req, res){
			res.writeHead(200, {'Content-Type': 'text/html'});
			// read index.html and send it to the client
			//var output = fs.readFileSync('./index.php', 'utf8');
			res.end('nodejs');
		});
		this.httpServer.listen(this.port);
	}
	
});