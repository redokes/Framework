Ext.define('Redokes.game.chat.Room', {
	extend:'Ext.panel.Panel',
	
	layout:'border',
	title:'Chat Room',
	game:false,
	
	style:{
		background:'transparent'
	},
	bodyStyle:{
		background:'transparent'
	},
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initChatLog();
		this.initUserList();
		this.initChatInput();
		this.initListeners();
	},
	
	initChatLog: function() {
		this.chatLog = Ext.create('Ext.panel.Panel', {
			region:'center',
			style:{
				background:'transparent'
			},
			bodyStyle:{
				background:'transparent'
			},
			frame:false,
			border:false,
			html:'<div class="chat-div"></div>'
		});
		this.items.push(this.chatLog);
	},
	
	initUserList: function() {
		this.userList = Ext.create('Ext.panel.Panel', {
			width:120,
			region:'east',
			collapsible:true,
			collapsed:true,
			frame:false,
			border:false,
			title:'Users',
			padding:5
		});
		this.items.push(this.userList);
	},
	
	initChatInput: function() {
		this.chatInput = Ext.create('Ext.form.field.Text', {
			width:'100%',
			region:'south',
			enableKeyEvents:true
		});
		this.items.push(this.chatInput);
	},
	
	initListeners: function() {
		this.chatInput.on('keypress', function(field, e) {
			if (e.keyCode == 13) {
				this.sendChat();
			}
		}, this);
		
		this.on('afterrender', function() {
			this.chatDiv = this.getEl().down('.chat-div');
			this.chatDiv.setStyle({
				height:'60px',
				overflow:'auto',
				padding:'5px'
			});
		}, this);
	},
	
	onExpand: function() {
		this.scrollToBottom();
		this.chatInput.setValue('');
	},
	
	sendChat: function() {
		var value = this.chatInput.getValue();
		if (value.length) {
			this.chatInput.setValue('');
			this.game.map.currentMap.socket.send('chat.send', {
				text:value
			});
			this.receiveChat('You', value);
		}
	},
	
	receiveChat: function(name, text) {
		text = '<p>' + name + ': ' + text + '</p>';
		this.chatDiv.dom.innerHTML += text;
		this.scrollToBottom();
	},
	
	scrollToBottom: function() {
		this.chatDiv.dom.scrollTop = this.chatDiv.dom.scrollHeight;
	}
});