var RedokesPath = '/js/redokes/src';
var ExtPath = '/js/ext-4.0.2a/src';
if (Ext.Loader.config.enabled) {
	Ext.Loader.setPath('Ext', ExtPath);
	Ext.Loader.setPath('Redokes', RedokesPath);
}
else {
	Ext.Loader.setConfig({
		enabled: true,
		paths:{
			Redokes: RedokesPath,
			Ext: ExtPath
		}
	});
}

var showDebug = true;
function d(param) {
	if (showDebug) {
		console.log(param);
	}
}

Ext.onReady(function() {
	var g = Ext.create('Redokes.game.Game', {
		renderTo:'game'
	});
});