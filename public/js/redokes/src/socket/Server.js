require('node-extjs');

Ext.Loader.setConfig({
	enabled: true,
	paths: {
		Redokes: __dirname + '/../'
	}
});

Ext.require('Redokes.node.server.Http');
Ext.require('Redokes.node.server.Socket');

Ext.onReady(function() {
	var httpServer = Ext.create('Redokes.node.server.Http');
	var socketServer = Ext.create('Redokes.node.server.Socket', httpServer.httpServer);
});