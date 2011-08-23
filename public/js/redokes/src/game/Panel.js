Ext.define('Redokes.game.Panel', {
	extend:'Ext.panel.Panel',
	
	title:'Wes Game',
	layout:'border',
	width:960,
	height:550,
	
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
		this.initGame();
		this.initToolbar();
		this.initChatWindow();
		this.initListeners();
	},
	
	initGame: function() {
		this.game = Ext.create('Redokes.game.Game', {
			region:'center'
		});
		this.items.push(this.game);
	},
	
	initToolbar: function() {
		this.musicButton = Ext.create('Ext.button.Button', {
			text:'Mute Music',
			enableToggle:true,
			scope:this,
			handler: function(button) {
				if (button.pressed) {
					this.game.muteMusic();
				}
				else {
					this.game.unmuteMusic();
				}
			}
		});
		
		
		this.loginWindow = Ext.create('Redokes.game.window.Login', {
			game:this.game
		});
		this.loginWindow.on('show', function() {
			this.game.player.ignoreInput = true;
		}, this);
		
		this.loginWindow.on('hide', function() {
			this.game.player.ignoreInput = false;
			if (!this.game.map.currentMap) {
				this.game.map.loadMap('Jidoor');
			}
		}, this);
		
		this.loginButton = Ext.create('Ext.button.Button', {
			text:'Login',
			scope:this,
			handler: function(button) {
				this.loginWindow.show();
			}
		});
		
		this.mapSelector = Ext.create('Redokes.map.editor.MapSelector');
		this.characterSelector = Ext.create('Redokes.map.editor.CharacterSelector');
		
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[
				this.loginButton,
				this.musicButton,
				this.mapSelector,
				this.characterSelector
			]
		});
		this.dockedItems.push(this.topBar);
	},
	
	initChatWindow: function() {
		this.chatPanel = Ext.create('Redokes.game.chat.Chat', {
			game:this.game,
			region:'south',
			height:140,
			collapsible:true,
			collapsed:true,
			title:'Press enter to chat. Press escape to close'
		});
		this.chatPanel.on('expand', function() {
			this.game.player.ignoreInput = true;
			var tab = this.chatPanel.getActiveTab();
			if (tab) {
				tab.chatInput.focus();
			}
		}, this);
		this.chatPanel.on('collapse', function() {
			this.game.player.ignoreInput = false;
		}, this);
		this.items.push(this.chatPanel);
	},
	
	initChatRoom: function() {
		this.chatPanel.addRoom(this.game.map.currentMap.title);
	},
	
	initListeners: function() {
		this.game.on('receiveChat', function(args) {
			Ext.bind(this.chatPanel.receiveChat, this.chatPanel, args)();
		}, this);
		
		this.game.on('mapload', function() {
			
			// Set up the map music
//			this.initMusic();
			
			// Set up the chat room
			this.initChatRoom();
			
		}, this);
		
		this.mapSelector.on('change', function(field, value) {
			this.focus();
			this.game.focus();
			this.game.map.loadMap(value);
		}, this);
		this.characterSelector.on('change', function(field, value) {
			this.focus();
			this.game.focus();
			this.game.player.loadImage(value);
		}, this);
		
		// Set up chat window toggle
		Ext.get(document).on('keydown', function(e) {
			switch(e.keyCode) {
				case e.ENTER:
					if (this.chatPanel.collapsed && this.game.map.currentMap && !this.game.player.ignoreInput) {
						this.chatPanel.expand();
					}
				break;
				case e.ESC:
					if (!this.chatPanel.collapsed) {
						this.chatPanel.collapse();
					}
				break;
				
				case 95:
					
				break;
			}
		}, this);
	},
	
	initEditor: function() {
		this.editor = Ext.create('Redokes.map.editor.Editor', {
			renderTo:this.editorWrap,
			height:800
		});
	}
	
});