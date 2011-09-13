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
		this.initStore();
		this.initUser();
		this.initMenu();
		this.initMenuItem();
		this.initView();
		this.initStream();
		this.initList();
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.Store', {
			scope: this,
			fields:[
				'name'
			],
			proxy: {
				type: 'localstorage',
				id  : 'files-users'
			}
		});
		this.store.load();
	},
	
	initUser: function(){
		var record = this.store.getAt(0);
		if(record == null){
			record = this.store.add({
				name: 'New User'
			});
			this.store.sync();
		}
		
		this.application.getSocketClient().socket.emit('setData', {
			user: record.data
		});
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
	
	initList: function(){
		this.list = Ext.create('Modules.files.js.user.view.List', {
			scope: this,
			application: this.application,
			module: this
		});
		this.application.getAccordion().add(new Ext.panel.Panel({
			scope: this,
			title: 'Users',
			layout: 'fit',
			items: [this.list]
		}));
	},
	
	//Helper functions
	getTree: function(){
		return this.view.tree;
	}
});