var RedokesPath = '/js/redokes/src';
var ExtPath = '/js/ext-4.0.7-gpl/src';
//var ExtPath = '/js/ext-4.1-pr1/src';
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