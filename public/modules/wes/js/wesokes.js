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

var showDebug = false;
function d(param) {
	if (showDebug) {
		console.log(param);
	}
}

Ext.onReady(function() {
	if (location.href.match(/edit/)) {
		Ext.create('Redokes.map.editor.Editor', {
			renderTo:'game',
			height:800
		});
		
	}
	else {
		Ext.create('Redokes.game.Panel', {
			renderTo:'game'
		});
	}
});