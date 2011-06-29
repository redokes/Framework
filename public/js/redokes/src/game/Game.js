Ext.define('Redokes.game.Game', {
	extend:Ext.util.Observable,
	requires:[
		'Redokes.map.Editor',
		'Redokes.sprite.Sprite'
	],
	
	map:false,
	player:false,
	players:false,
	playerCount:0,
	width:0,
	height:0,
	numTilesWidth:15,
	numTilesHeight:10,
	tileSize:32,
	fps:30,
	frameCount:0,
	timer:false,
	socketManager:false,

	constructor: function() {
		if (location.href.match(/edit/)) {
			this.initEditor();
		}
		this.initPageMarkup();
		this.initFPS();
		this.init();
		window.game = this;
	},
	
	initEditor: function() {
		this.editorWrap = Ext.get(document.createElement('div'));
		this.editorWrap.addCls('editorWrap');
		Ext.getBody().appendChild(this.editorWrap);
		this.editor = Ext.create('Redokes.map.Editor', {
			renderTo:this.editorWrap,
			height:800
		});
	},

	initPageMarkup: function() {
		this.gameWrapDiv = Ext.get(document.createElement('div'));
		this.gameWrapDiv.addCls('gameWrap');
		Ext.getBody().appendChild(this.gameWrapDiv);

		this.canvas = Ext.get(document.createElement('canvas'));
		this.canvas.addCls('canvas');

		this.width = this.tileSize * this.numTilesWidth
		this.height = this.tileSize * this.numTilesHeight
		
		this.canvas.dom.width = this.width;
		this.canvas.dom.height = this.height;
		
		this.context = this.canvas.dom.getContext('2d');
		this.gameWrapDiv.appendChild(this.canvas);

		this.music = Ext.get(document.createElement('audio'));
		Ext.getBody().appendChild(this.music);
	},

	initFPS: function() {
		this.timer = new Date();
		this.fpsDisplay = Ext.get(document.createElement('div'));
		this.fpsDisplay.addCls('fpsDisplay');
		this.gameWrapDiv.appendChild(this.fpsDisplay);
		
		this.lastFrameCount = 0;
		setInterval(Ext.Function.bind(function() {
			this.fpsDisplay.update(Math.round(((this.frameCount - this.lastFrameCount) / 2)) + ' FPS');
			this.lastFrameCount = this.frameCount;
		}, this), 2000);
	},

	init: function() {
		this.initMap();
	},
	
	initGameLoop: function() {
		this.gameInterval = setInterval(Ext.Function.bind(this.gameLoop, this), 1000/this.fps);
	},

	gameLoop: function() {
		this.context.clearRect(0, 0, this.width, this.height);
		this.player.checkKeys();
		this.player.movePlayer();
		this.map.draw();
		this.frameCount++;
	},
	
	initMap: function() {
		this.map = Ext.create('Redokes.map.Map', this);
		this.map.on('mapload', this.initMusic, this);
		this.map.on('mapload', this.initPlayer, this);
		this.map.loadMap('Wes');
	},
	
	initMusic: function() {
		if (this.map.currentMap.music) {
			this.music.dom.src = this.map.currentMap.music;
			this.music.dom.play();
			this.setMusicVolume(.5);
			this.muteMusic();
		}
	},
	
	setMusicVolume: function(volume) {
		this.music.dom.volume = volume;
	},
	
	muteMusic: function() {
		this.lastMusicVolume = this.music.dom.volume;
		this.setMusicVolume(0);
	},
	
	unmuteMusic: function() {
		this.setMusicVolume(this.lastMusicVolume);
	},
	
	initPlayer: function() {
		if (!this.player) {
			this.players = {};
			this.player = Ext.create('Redokes.sprite.PlayerUser', {
				game:this,
				img:'/modules/wes/img/sprite/player/mog.png',
				width:32,
				height:44,
				context:this.context
			});
			this.player.initControls();
			this.map.follow(this.player);
			this.initGameLoop();
		}
		this.player.setToTile(this.map.currentMap.spawnX, this.map.currentMap.spawnY, this.map.currentMap.spawnLayer, this.tileSize);
		this.initSocketManager();
	},
	
	initRemotePlayer: function(request) {
		d('Init remote player ' + request.session);
		this.addRemotePlayer(request.session);
	},
	
	initRemotePlayers: function(request) {
		d('Init remote players');
		var clients = request.data.clients;
		for (var sessionId in clients) {
			this.addRemotePlayer(sessionId);
		}
	},
	
	addRemotePlayer: function(sessionId) {
		d('Add remote player ' + sessionId);
		this.players[sessionId] = Ext.create('Redokes.sprite.PlayerUser', {
			img:'/modules/wes/img/sprite/player/mog.png',
			width:32,
			height:44,
			x:0,
			y:0,
			game:this,
			context:this.context
		});
	},
	
	removeRemotePlayer: function(request) {
		d('Remove remote player ' + request.session);
		delete this.players[request.session];
	},
	
	updateRemotePlayer: function(request) {
		d('Update remote player ' + request.session);
		
	},

	initSocketManager: function() {
		d('Init Socket Manager');
		this.socketManager = Ext.create('Redokes.game.SocketManager', {
			game:this,
			url:'redokes.com'
		});
		window.sm = this.socketManager;
	},
	
	moveToTile: function(request) {
		var data = request.data;
		this.players[request.session].x = data.x;
		this.players[request.session].y = data.y;
	}
	
});