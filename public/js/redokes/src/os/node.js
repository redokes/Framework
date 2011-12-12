require('node-extjs');

Ext.Loader.setConfig({
	enabled: true,
	paths: {
		Redokes: __dirname + '/../'
	}
});

Ext.require('Redokes.os.OS');