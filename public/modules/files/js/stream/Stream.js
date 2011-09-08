/**
 * Stream module
 * This is a singleton class and connot be directly created.
 * @extends Modules.files.js.module.Abstract
 * @singleton
 */
Ext.define('Modules.files.js.stream.Stream', {
	extend:'Modules.files.js.module.Abstract',
	singleton: true,
	
	//Config
	
	/**
	 * @type String
	 * @property title title
	 */
	name: 'stream',
	displayTitle: 'Stream',

	//Init Functions
	init: function(){
		this.initMenuItem();
		this.initView();
	},
	
	initMenuItem: function(){
		this.application.getMenu().addMenuItem({
			scope: this,
			text: 'Stream',
			handler: function(){
				this.application.setActiveItem(this.view);
			}
		});
	},
	
	initView: function(){
		this.view = Ext.create('Modules.files.js.stream.view.Stream', {
			scope: this,
			title: 'Stream'
		});
		this.addMessage({
			text: 'Welcome...'
		});
		this.application.getCenter().add(this.view);
	},
	
	//Helper Functions
	addMessage: function(record){
		this.view.addMessage(record);
	}
});