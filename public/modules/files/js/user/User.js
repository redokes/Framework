/**
 * User module
 * This is a singleton class and connot be directly created.
 * @extends Modules.files.js.module.Abstract
 * @singleton
 */
Ext.define('Modules.files.js.user.User', {
	extend:'Modules.files.js.module.Abstract',
	singleton: true,
	
	//Config
	name: 'user',
	displayTitle: 'User',

	//Init Functions
	init: function(){
		this.initMenu();
	},
	
	initMenu: function(){
		this.menu = new Ext.panel.Panel({
			scope: this,
			title: 'My Shared Folders'
		});
		this.application.getWest().add(this.menu);
	}
});