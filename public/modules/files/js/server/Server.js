require('node-extjs');

Ext.Loader.setConfig({
	enabled: true,
	paths: {
		Redokes: __dirname + '/../../../../js/redokes/src',
		Modules: __dirname + '/../../../'
	}
});

Ext.require('Modules.files.js.server.Http');
Ext.require('Modules.files.js.server.Socket');

Ext.onReady(function() {
	var httpServer = Ext.create('Modules.files.js.server.Http');
	var socketServer = Ext.create('Modules.files.js.server.Socket', httpServer);
});