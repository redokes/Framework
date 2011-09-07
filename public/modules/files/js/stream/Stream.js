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
		this.initMenu();
	},
	
	initMenu: function(){
		this.application.getMenu().addMenuItem({
			text: 'Stream'
		});
	}
});