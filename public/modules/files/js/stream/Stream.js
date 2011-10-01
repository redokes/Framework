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
		this.initBadge();
		this.initView();
	},
	
	initMenuItem: function(){
		this.menuItem = new Ext.menu.Item({
			scope: this,
			text: 'Stream',
			handler: function(){
				this.application.setActiveItem(this.view);
			}
		})
		this.application.getMenu().addMenuItem(this.menuItem);
	},
	
	initBadge: function(){
		if(!this.menuItem.rendered){
			this.menuItem.on('afterrender', function(){
				this.initBadge();
			}, this);
			return;
		}
		
		this.badge = Ext.get(this.menuItem.getEl().createChild({
            tag: 'div',
			html: '',
			cls: 'menu-item-badge'
        }));
		this.badge.count = 0;
		this.badge.hide();
		
		this.view.store.on('add', function(){
			if(this.application.getActiveItem != this.view){
				this.badge.count++;
				this.badge.update(this.badge.count);
				this.badge.show();
			}
		}, this);
		
		this.view.on('show', function(){
			this.badge.count = 0;
			this.badge.hide();
		}, this);
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