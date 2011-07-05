Ext.define('Redokes.game.Game', {
	extend:'Ext.panel.Panel',
	requires:[
		'Redokes.map.Editor',
		'Redokes.sprite.Sprite'
	],
	
	map:false,
	player:false,
	players:false,
	playerCount:0,
	width:480,
	height:320,
	numTilesWidth:15,
	numTilesHeight:10,
	tileSize:32,
	fps:30,
	frameCount:0,
	timer:false,
	socketManager:false,
	title:'Wes Game',
	layout:'border',
	
	initComponent: function() {
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		if (location.href.match(/edit/)) {
			this.initEditor();
		}
//		this.initToolbar();
		this.initCanvas();
//		this.initUserList();
	},
	
	initToolbar: function() {
		this.musicButton = Ext.create('Ext.button.Button', {
			text:'Music',
			enableToggle:true,
			scope:this,
			handler: function(button) {
				if (button.pressed) {
					this.unmuteMusic();
				}
				else {
					this.muteMusic();
				}
			}
		})
		
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			ui:'footer',
			items:[this.musicButton]
		});
		this.dockedItems.push(this.topBar);
		
		
	},
	
	initCanvas: function() {
		this.canvasHtml = Ext.core.DomHelper.markup({
			tag:'canvas',
			cls:'canvas',
			width:this.tileSize * this.numTilesWidth,
			height:this.tileSize * this.numTilesHeight
		});
		
		this.centerPanel = Ext.create('Ext.panel.Panel', {
			region:'center',
			width:480,
			height:320,
			html:this.canvasHtml
		});
		this.items.push(this.centerPanel);
		
//		this.height += this.centerPanel.height;
//		this.width += this.centerPanel.width;
		
		this.on('afterrender', function(){
			this.canvas = this.centerPanel.getEl().down('canvas');
			this.context = this.canvas.dom.getContext('2d');
			
			this.initFPS();
			this.initAudio();
			this.initMap();
		}, this);
	},
	
	initUserList: function() {
		this.userListPanel = Ext.create('Ext.panel.Panel', {
			region:'east',
			title:'Users',
			width:150
		});
		this.items.push(this.userListPanel);
		
//		this.width += this.userListPanel.width;	
		
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
	
	initMap: function() {
		this.map = Ext.create('Redokes.map.Map', this);
		this.map.on('mapload', this.initMusic, this);
		this.map.on('mapload', this.initPlayer, this);
		this.map.loadMap('Wes');
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
		var remotePlayer = Ext.create('Redokes.sprite.PlayerUser', {
			img:'/modules/wes/img/sprite/player/mog.png',
			width:32,
			height:44,
			x:0,
			y:0,
			game:this,
			context:this.context
		});
		this.players[sessionId] = remotePlayer;
		this.player.socketMovePlayer(this.player.currentAnimation.title);
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