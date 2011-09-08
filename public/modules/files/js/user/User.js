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
		this.initMenuItem();
		this.initView();
		this.initStream();
	},
	
	initMenuItem: function(){
		this.menuItem = new Ext.menu.Item({
			scope: this,
			text: 'My Files',
			handler: function(){
				this.application.setActiveItem(this.view);
			}
		});
		this.application.getMenu().addMenuItem(this.menuItem);
	},
	
	initMenu: function(){
		this.menu = Ext.create('Modules.files.js.user.Menu', {
			scope: this,
			title: 'Shared Folders'
		});
		this.application.getAccordion().add(this.menu);
	},
	
	initView: function(){
		this.view = Ext.create('Modules.files.js.user.view.User', {
			scope: this,
			title: 'User'
		});
		this.application.getCenter().add(this.view);
		
		this.menu.folder.on('select', function(){
			console.log('select');
			this.view.tree.addFileList(this.menu.folder.getFiles());
		}, this);
	},
	
	initStream: function(){
		var stream = this.application.getModule('stream');
		if(!stream){
			this.appication.onModuleReady('stream', function(){
				this.initStream();
			}, this);
			return;
		}
		
		this.menu.folder.on('select', function(){
			var stream = this.application.getModule('stream');
			stream.addMessage({
				text: 'You just added ' + this.menu.folder.getFiles().length + ' file(s)'
			});
		}, this);
	},
	
	//Helper functions
	getTree: function(){
		return this.view.tree;
	}
});