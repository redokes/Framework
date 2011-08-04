Ext.define('Redokes.game.Panel', {
	extend:'Ext.panel.Panel',
	requires:[
		'Redokes.map.Editor',
		'Redokes.sprite.Sprite'
	],
	
	map:false,
	player:false,
	players:false,
	playerCount:0,
	width:484,
	height:402,
	numTilesWidth:15,
	numTilesHeight:10,
	tileSize:32,
	fps:30,
	frameCount:0,
	timer:false,
	socketManager:false,
	title:'Wes Game',
	layout:'border',
	
	bodyStyle:{
		background:'transparent'
	},
	
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
		this.initToolbar();
		this.initCanvas();
		this.initChatWindow();
		this.initListeners();
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
	
	initChatWindow: function() {
		
		this.chatPanel = Ext.create('Ext.panel.Panel', {
			flex:3,
			region:'center',
			style:{
				background:'transparent'
			},
			bodyStyle:{
				background:'transparent'
			},
			frame:false,
			border:false
		});
		
		this.userListPanel = Ext.create('Ext.panel.Panel', {
			width:116,
			region:'east',
			collapsible:true,
			collapsed:true,
			frame:false,
			border:false
		});
		
		this.southPanel = Ext.create('Ext.panel.Panel', {
			region:'south',
			height:140,
			collapsible:true,
			collapsed:true,
			hideCollapseTool:true,
			style:{
				background:'transparent'
			},
			bodyStyle:{
				background:'transparent'
			},
			layout:'border',
			items:[
				this.chatPanel,
				this.userListPanel
			]
		});
		this.items.push(this.southPanel);
	},
	
	initListeners: function() {
		// Set up chat window toggle
		Ext.get(document).on('keypress', function(e) {
			switch(e.button) {
				case 12:
					
				break;
				case 95:
					this.southPanel.toggleCollapse();
				break;
			}
		}, this)
;	},
	
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
			height:800,
			game:this
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
		d('Init Player');
		this.players = {};
		
		if (this.player) {
			// Kill the current socket manager and start a new one with the new map name
			this.socketManager.disconnect();
		}
		else {
			// Make the user controlled player
			this.player = Ext.create('Redokes.sprite.PlayerUser', {
				game:this,
				img:'/modules/wes/img/sprite/player/mog.png',
				width:32,
				height:44,
				context:this.context
			});
			// Set up the events to control the player
			this.player.initControls();
			
			// Tell the map to follow this user
			this.map.follow(this.player);
			
			// Start the game loop
			this.initGameLoop();
		}
		
		// Init the socket manager for this map
		this.initSocketManager(this.map.currentMap.title);
		
		// Move the player to the spawn point of the current map
		this.player.setToTile(this.map.currentMap.spawnX, this.map.currentMap.spawnY, this.map.currentMap.spawnLayer, this.tileSize);
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

	initSocketManager: function(instanceName) {
		d('Init Socket Manager');
		this.socketManager = Ext.create('Redokes.game.SocketManager', {
			game:this,
			url:'redokes.com',
			instanceName:instanceName,
			data:{
				instanceName:instanceName
			}
		});
		window.sm = this.socketManager;
	},
	
	moveToTile: function(request) {
		var data = request.data;
		this.players[request.session].x = data.x;
		this.players[request.session].y = data.y;
	}
	
});