/**
 * Chat module
 * This is a singleton class and connot be directly created.
 * @extends Modules.files.js.module.Abstract
 * @singleton
 */
Ext.define('Modules.files.js.chat.Chat', {
	extend:'Modules.files.js.module.Abstract',
	singleton: true,
	
	//Config
	name: 'chat',
	displayTitle: 'Chat',

	//Init Functions
	init: function(){
		this.application.onModuleReady('stream', function(stream){
			this.initMessagePanel();
		}, this);
	},
	
	initMenu: function(){
		this.menu = Ext.create('Modules.files.js.user.Menu', {
			scope: this,
			title: 'Shared Folders'
		});
		this.application.getAccordion().add(this.menu);
	},
	
	initMessagePanel: function(){
		//Create a message field so the user can send messages
		this.messageField = Ext.create('Ext.form.field.Text', {
    		//fieldLabel: 'Message',
	    	//labelWidth: 50,
			anchor: '100%',
	    	enableKeyEvents: true,
			emptyText: 'Type your message here...',
			listeners: {
				scope: this,
                specialkey: function(field, e){
					/*
                    if (e.getKey() == e.ENTER) {
                        this.client.send(
							'user',
							'message',
							{ message: this.messageField.getValue() }
						);
						this.addMessage(0, 'Me', this.messageField.getValue());
						this.messageField.setValue('');
                    }
					*/
                }
            }
    	});
		
		//on key up, send a request to the server that says the user is typing or not typing
		/*
    	this.messageField.on('keyup', function(){
    		this.client.send(
				'user',
				'typing',
				{
					message: this.messageField.getValue()
				}
			);
    	}, this);
		*/
		
		//Create a toolbar to hold the message field
    	this.messagePanel = Ext.create('Ext.panel.Panel', {
			dock: 'bottom',
			layout: 'anchor',
			bodyPadding: 5,
			bodyCls: 'message-footer',
    	    items: [this.messageField]
    	});
		this.application.getCenter().dockedItems.add(this.messagePanel);
	}
});