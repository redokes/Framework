/**
 * Main application
 * @extends Ext.container.Viewport
 */
Ext.define('Modules.files.js.Application', {
	extend: 'Ext.container.Viewport',
	
	//Require Modules
	requires:[
		'Modules.files.js.stream.Stream',
		'Modules.files.js.user.User'
	],
	
	//Config
	layout: 'border',
	modules: {},
	
	//Inits
	initComponent: function(){
		//Clear arrays and objects
		this.items = [];
		this.modules = {};
		
		//Add Events
		this.addEvents(
			'registermodule'
		);
		
		//Init the items
		this.init();
		
		//Call the parent function
		this.callParent(arguments);
	},
	
	init: function(){
		//Init Ext items
		this.initExt();
		
		//Containers
		this.initNorth();
		this.initSouth();
		this.initWest();
		this.initCenter();
		
		//Menus
		this.initMenu();
		this.initAccordion();
		
		//Init the modules
		this.initModules();
	},
	
	initModules: function(){
		Modules.files.js.stream.Stream.register(this);
		Modules.files.js.user.User.register(this);
	},
	
	initExt: function(){
		//Quicktips
		Ext.tip.QuickTipManager.init();
	},
	
	
	initNorth: function(){
		/**
		 * @type Ext.panel.Panel
		 * @property north north panel
		 */
		this.north = new Ext.panel.Panel({
			scope: this,
			title: 'North',
			unstyled: true,
			border: false,
			hidden: true,
			region: 'north'
		});
		this.items.push(this.north);
	},
	
	getNorth: function(){
		return this.northPanel;
	},
	
	initSouth: function(){
		this.south = Ext.create('Ext.panel.Panel', {
			scope: this,
			region: 'south',
			hidden: true
		});
		this.items.push(this.south);
	},
	
	getSouth: function(){
		return this.south;
	},
	
	initWest: function(){
		/**
		 * @type Ext.panel.Panel
		 * @property west west panel
		 */
		this.west = Ext.create('Ext.panel.Panel', {
			scope: this,
			title: 'West',
			region: 'west',
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			width: 250,
			split: true
		});
		this.items.push(this.west);
	},
	
	/**
     * Gets the west panel
     * @return {Ext.panel.Panel} west
     */
	getWest: function(){
		return this.west;
	},
	
	initCenter: function(){
		/**
		 * @type Ext.panel.Panel
		 * @property center center panel
		 */
		this.center = Ext.create('Ext.panel.Panel', {
			scope: this,
			title: 'Center',
			region: 'center',
			layout: 'card',
			activeItem: 0,
			setActiveItem: function(item){
				this.getLayout().setActiveItem(item);
			},
			getActiveItem: function(){
				return this.getLayout().getActiveItem();
			}
		});
		this.items.push(this.center);
	},
	
	/**
     * Gets the center panel
     * @return {Ext.panel.Panel} center
     */
	getCenter: function(){
		return this.center;
	},
	
	initMenu: function(){
		this.menu = Ext.create('Modules.files.js.menu.Menu', {
			scope: this
		});
		this.west.add(this.menu);
	},
	
	getMenu: function(){
		return this.menu;
	},
	
	initAccordion: function(){
		this.accordion = new Ext.panel.Panel({
			scope: this,
			layout: {
				type: 'accordion'
			},
			flex: 1
		});
		this.west.add(this.accordion);
	},
	
	getAccordion: function(){
		return this.accordion;
	},

	registerModule: function(module){
		if(module.name != null){
			this.modules[module.name] = module;
			this.fireEvent('registermodule', this, module.name, module);
		}
	},
	
	getModule: function(name){
		if(this.modules[name] != null){
			return this.modules[name];
		}
		return false;
	},
	
	onModuleReady: function(name, callback, scope, options){
		if(this.getModule(name)){
			Ext.bind(callback, scope)(this.getModule(name), options);
		}
		else{
			this.on('registermodule', function(application, name, module, options){
				if(name == options.name){
					Ext.bind(options.callback, options.scope)(module, options.options);
				}
			}, this, {name: name, callback: callback, scope: scope, options: options});
		}
	}
});