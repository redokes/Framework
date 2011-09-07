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
		this.initUserView();
	},
	
	initMenu: function(){
		this.menu = Ext.create('Modules.files.js.user.Menu', {
			scope: this,
			title: 'Shared Folders'
		});
		this.application.getAccordion().add(this.menu);
	},
	
	initUserView: function(){
		this.userView = Ext.create('Modules.files.js.user.view.User', {
			scope: this,
			title: 'User'
		});
		this.application.getCenter().add(this.userView);
		
		this.menu.folder.on('select', function(){
			this.userView.tree.addFileList(this.menu.folder.getFiles());
		}, this);
	}
});