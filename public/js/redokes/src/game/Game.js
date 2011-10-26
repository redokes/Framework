Ext.define('Redokes.game.Game', {
	extend:'Ext.panel.Panel',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	map:false,
	player:false,
	
	width:484,
	height:402,
	numTilesWidth:15,
	numTilesHeight:10,
	tileSize:32,
	fps:30,
	frameCount:0,
	timer:false,
	socketManager:false,
	frame:false,
	border:false,
	
	initComponent: function() {
		d('Game constructor');
		this.addEvents('mapload', 'receiveChat');
		this.init();
		this.callParent(arguments);
		window.game = this;
	},
	
	init: function() {
		this.initSocketManager();
		this.initCanvas();
	},
	
	initCanvas: function() {
		this.html = Ext.core.DomHelper.markup({
			tag:'canvas',
			cls:'canvas',
			width:this.tileSize * this.numTilesWidth,
			height:this.tileSize * this.numTilesHeight
		});
		
		this.on('afterrender', function() {
			this.canvas = this.getEl().down('canvas');
//			this.canvas.setStyle({
//				zoom:2
//			});
//			this.canvas.set({
//				width:this.canvas.getWidth(),
//				height:this.canvas.getHeight()
//			});
			this.context = this.canvas.dom.getContext('2d');
			
			this.initFPS();
			this.initAudio();
			this.initPlayer();
			this.initMap();
		}, this);
	},
	
	initSocketManager: function() {
		d('Init Socket Manager');
		this.socketManager = Ext.create('Redokes.socket.SocketManager', {
			game:this,
			url:'http://localhost:8080'
		});
		this.socketManager.on('initclient', this.onInitSocketClient, this);
		this.socketManager.createNamespace('');
		window.sm = this.socketManager;
	},
	
	initMap: function() {
		this.map = Ext.create('Redokes.map.Map', {
			game:this
		});
		this.map.on('mapload', function() {
			this.fireEvent('mapload');
		}, this);
		
		this.map.on('mapload', this.initGameLoop, this, {single:true});
		
//		this.map.loadMap('Wes');
	},
	
	gameLoop: function() {
		this.context.clearRect(0, 0, this.width, this.height);
		this.player.checkKeys();
		this.player.movePlayer();
		this.map.draw();
		this.frameCount++;
	},
	
	initFPS: function() {
		this.timer = new Date();
		this.lastFrameCount = 0;
		setInterval(Ext.Function.bind(function() {
			this.setTitle(Math.round(((this.frameCount - this.lastFrameCount) / 2)) + ' FPS');
			this.lastFrameCount = this.frameCount;
		}, this), 2000);
	},
	
	initAudio: function() {
		this.music = Ext.get(document.createElement('audio'));
		this.getEl().appendChild(this.music);
	},
	
	initGameLoop: function() {
		this.gameInterval = setInterval(Ext.Function.bind(this.gameLoop, this), 1000/this.fps);
	},

	initMusic: function() {
		if (this.map.currentMap.music) {
			if (!this.music.dom.src.match(this.map.currentMap.music)) {
				this.music.dom.src = this.map.currentMap.music;
				this.music.dom.play();
			}
//			this.setMusicVolume(.5);
//			this.muteMusic();
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
		d('Init Player');
		// Make the user controlled player
		this.player = Ext.create('Redokes.sprite.PlayerUser', {
			game:this,
			img:'/modules/wes/img/sprites/players/mog.png',
			width:32,
			height:48,
			context:this.context,
			doSocketCalls:true
		});

		// Set up the events to control the player
		this.player.initControls();
	},
	
	onInitSocketClient: function(client) {
		// Send data to server about the player details like name, sprite
		this.log('Made socket client ' + client.namespace);
		this.socket = client;
	},
	
	receiveChat: function() {
		this.fireEvent('receiveChat', arguments);
	}
});