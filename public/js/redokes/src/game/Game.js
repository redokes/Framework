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

	constructor: function() {
		this.initEditor();
		this.initPageMarkup();
		this.initFPS();
		this.init();
	},
	
	initEditor: function() {
		this.editorWrap = Ext.get(document.createElement('div'));
		this.editorWrap.addCls('editorWrap');
		Ext.getBody().appendChild(this.editorWrap);
		this.editor = Ext.create('Redokes.map.Editor', {
			renderTo:this.editorWrap,
			height:500
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

//		this.audio = Ext.get(document.createElement('audio'));
//		Ext.getBody().appendChild(this.audio);
//		this.audio.dom.src = '/modules/wes/town1.mp3';
//		this.audio.dom.play();
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
		this.map.on('mapload', this.initPlayer, this);
		this.map.loadMap('Town2');
		window.wesMap = this.map;
	},
	
	initPlayer: function() {
		if (!this.player) {
			this.players = [];
			this.player = Ext.create('Redokes.sprite.PlayerUser', {
				game:this,
				img:'/modules/wes/img/sprite/player/mog.png',
				width:32,
				height:44,
				context:this.context
			});
			this.addPlayer(this.player);
			this.player.initControls();
			this.map.follow(this.player);
			this.initGameLoop();
		}
		this.player.setToTile(this.map.currentMap.spawnX, this.map.currentMap.spawnY, this.map.currentMap.spawnLayer, this.tileSize);
		
	},

	addPlayer: function(player) {
		this.players.push(player);
		this.playerCount = this.players.length;
	}
	
});