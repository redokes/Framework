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
	var socket = Ext.create('Redokes.socket.Client', {
		url:'http://localhost:8080'
	});
	socket.on('connect', function() {
		console.log('connect');
	});
	
	socket.on('disconnect', function() {
		console.log('disconnect');
	});
	
	socket.on('otherConnect', function() {
		console.log('otherconnect');
	});
	
	socket.on('otherDisconnect', function() {
		console.log('other disconnect');
	});
	
	return;
	var g = Ext.create('Redokes.game.Panel', {
		renderTo:'game'
	});
});