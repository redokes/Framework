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
		this.onViewReady(function(){
			this.addMessage(Ext.create(this.getModel(), {
				text: 'Welcome!',
				module: this.getModuleName()
			}));
		}, this);
	},
		
	//Helper Functions
	getModel: function(){
		return Modules.files.js.model.Stream;
	},
	
	addMessage: function(record){
		this.view.addMessage(record);
	}
});