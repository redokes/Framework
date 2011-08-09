Ext.define('Redokes.game.chat.Chat', {
	extend:'Ext.tab.Panel',
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
		this.initListeners();
	},
	
	initListeners: function() {
		this.on('expand', function() {
			this.doLayout();
			var tab = this.getActiveTab();
			if (tab) {
				tab.onExpand();
			}
		}, this);
	},
	
	addRoom: function(title) {
		var itemId = title.replace(/ /, '');
		var tab = this.child('#' + itemId);
		if (tab) {
			this.setActiveTab(tab);
		}
		else {
			var room = Ext.create('Redokes.game.chat.Room', {
				game:this.game,
				title:title,
				itemId:itemId
			});
			tab = this.add(room);
			this.setActiveTab(tab);
		}
	},
	
	receiveChat: function(namespace, id, text) {
		var itemId = namespace.replace(/ /, '');
		var tab = this.child('#' + itemId);
		if (tab) {
			tab.receiveChat(id, text);
		}
	}
	
});