Ext.define('Redokes.game.Panel', {
	extend:'Ext.panel.Panel',
	
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
		this.initSocketManager();
		this.initToolbar();
		this.initCanvas();
		this.initChatWindow();
		this.initListeners();
		window.game = this;
	},
	
	initToolbar: function() {
		this.musicButton = Ext.create('Ext.button.Button', {
			text:'Mute Music',
			enableToggle:true,
			scope:this,
			handler: function(button) {
				if (button.pressed) {
					this.muteMusic();
				}
				else {
					this.unmuteMusic();
				}
			}
		})
		
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[
				this.musicButton, {
					scope:this,
					text:'Wes Map',
					handler: function() {
						this.map.loadMap('Wes')
					}
				},{
					scope:this,
					text:'Default Map',
					handler: function() {
						this.map.loadMap('Default')
					}
				}
			]
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
			this.initPlayer();
			this.initMap();
		}, this);
	},
	
	initChatWindow: function() {
		this.chatPanel = Ext.create('Redokes.game.chat.Chat', {
			game:this,
			region:'south',
			height:140,
			collapsible:true,
			collapsed:true,
			title:'Press enter to chat. Press escape to close'
		});
		this.chatPanel.on('expand', function() {
			this.player.ignoreInput = true;
			var tab = this.chatPanel.getActiveTab();
			if (tab) {
				tab.chatInput.focus();
			}
		}, this);
		this.chatPanel.on('collapse', function() {
			this.player.ignoreInput = false;
		}, this);
		this.items.push(this.chatPanel);
	},
	
	initChatRoom: function() {
		this.chatPanel.addRoom(this.map.currentMap.title);
	},
	
	initListeners: function() {
		// Set up chat window toggle
		Ext.get(document).on('keydown', function(e) {
			switch(e.button) {
				case 12:
					if (this.chatPanel.collapsed) {
						this.chatPanel.expand();
					}
				break;
				case 26:
					if (!this.chatPanel.collapsed) {
						this.chatPanel.collapse();
					}
				break;
				
				case 95:
					
				break;
			}
		}, this);
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
		this.map.on('mapload', function() {
			
			// Set up the map music
//			this.initMusic();
			
			// Set up the chat room
			this.initChatRoom();
		}, this);
		
		this.map.on('mapload', this.initGameLoop, this, {single:true});
		
		if (location.href.match(/edit/)) {
			this.initEditor();
		}
//		this.map.loadMap('Wes');
	},
	
	initEditor: function() {
		this.editorWrap = Ext.get(document.createElement('div'));
		this.editorWrap.addCls('editorWrap');
		Ext.getBody().appendChild(this.editorWrap);
		this.editor = Ext.create('Redokes.map.editor.Editor', {
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
			img:'/modules/wes/img/sprite/player/mog.png',
			width:32,
			height:44,
			context:this.context
		});

		// Set up the events to control the player
		this.player.initControls();
	},
	
	initSocketManager: function() {
		d('Init Socket Manager');
		this.socketManager = Ext.create('Redokes.game.SocketManager', {
			game:this,
			url:'http://localhost:8080'
		});
//		this.socketManager.on('initclient', this.onInitSocketClient, this);
		this.socketManager.createNamespace('');
		window.sm = this.socketManager;
	},
	
	onInitSocketClient: function(client) {
		// Send data to server about the player details like name, sprite
		d('Made socket client ' + client.namespace);
		
	}
	
});