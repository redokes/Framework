var RedokesPath = '/js/redokes/src';
var ExtPath = '/js/ext-4.0.2a/src';
var ModulesPath = '/modules';

if (Ext.Loader.config.enabled) {
	Ext.Loader.setPath('Ext', ExtPath);
	Ext.Loader.setPath('Redokes', RedokesPath);
	Ext.Loader.setPath('Modules', ModulesPath);
}
else {
	Ext.Loader.setConfig({
		enabled: true,
		paths:{
			Redokes: RedokesPath,
			Ext: ExtPath,
			Modules: ModulesPath
		}
	});
}