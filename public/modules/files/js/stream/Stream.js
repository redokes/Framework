Ext.define('Modules.files.js.stream.Stream', {
	extend: 'Modules.files.js.module.Module',
	singleton: true,
	
	//Requires
	requires:[
		'Modules.files.js.model.Stream'
	],
	
	//Config
	config:{
		name: 'stream',
		title: 'Dashboard',
		navigationTitle: 'Stream',
		isMainNavigationItem: true,
		viewClass: 'Modules.files.js.stream.view.Stream'
	},
	
	//Init Functions
	init: function(){
		this.initWelcomeMessage();
		this.initStreamHandler();
	},
	
	initWelcomeMessage: function(){
		this.onViewReady(function(){
			this.addMessage(Ext.create(this.getModel(), {
				text: 'Welcome!',
				module: this.getModuleName()
			}));
		}, this);
	},
	
	initNavigation: function(){
		//Call parent
		this.callParent(arguments);
		
		//Listen for when the view is ready
		this.onViewReady(function(){
			
			//Listen for a record added to the stream
			this.getView().store.on('add', function(){
				if(this.getApplication().getActive() != this.getView()){
					var badgeNumber = parseInt(this.getMainNavigationItem().getBadgeText()) || 0;
					badgeNumber++;
					this.getMainNavigationItem().setBadgeText(badgeNumber.toString());
				}
			}, this);
			
			//Listen for when this module goes active and clear the badge
			this.on('show', function(){
				this.getMainNavigationItem().setBadgeText('');
			}, this);
			
		}, this);
	},
	
	initStreamHandler: function(){
		Ext.create('Redokes.socket.client.Handler', {
			scope: this,
			client: this.getApplication().getSocketClient(),
			module: 'stream',
			actions: {
				message: function(handler, response){
					this.addMessage(response.data);
				}
			}
		});
	},
		
	//Helper Functions
	getModel: function(){
		return Modules.files.js.model.Stream;
	},
	
	addMessage: function(record){
		this.view.addMessage(record);
	}
});