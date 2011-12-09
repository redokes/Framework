Ext.define('Redokes.application.Application', {
	extend: 'Ext.container.Viewport',
    singleton: true,
	layout: 'border',
	
	modules: false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCenter();
		this.initNorth();
		this.initWest();
		
		this.initModuleStore();
		this.initLauncherTemplate();
		this.initLauncherView();
		this.loadModules();
	},
	
	initCenter: function() {
		this.center = Ext.create('Ext.container.Container', {
			region: 'center',
			layout: 'card'
		});
		this.items.push(this.center);
	},
	
	initWest: function() {
		this.west = Ext.create('Ext.container.Container', {
			region: 'west',
			width: 55
		});
		this.items.push(this.west);
	},
	
	initNorth: function() {
		this.north = Ext.create('Ext.container.Container', {
			region: 'north',
			height: 30,
			layout: 'hbox',
			padding: 4
		});
		this.items.push(this.north);
		
		this.logo = Ext.create('Ext.container.Container', {
			html: 'Redokes Framework',
			flex: 1
		});
		this.north.add(this.logo);
		
		this.login = Ext.create('Ext.button.Button', {
			text: 'Login'
		});
		this.north.add(this.login);
	},
	
	initModuleStore: function() {
		this.moduleStore = Ext.create('Ext.data.Store', {
			fields: [
				'instance',
				'cls',
				'title',
				'name'
			],
			proxy: {
				type: 'memory'
			}
		});
	},
	
	initLauncherTemplate: function() {
		this.launcherTpl = Ext.create('Ext.XTemplate',
			'<div class="module-items-wrap">',
				'<tpl for=".">',
					'<div class="module-item">',
						'<span class="module-icon-wrap">',
							'<span class="module-icon-active"></span><img class="module-icon" src="{instance.iconLarge}" />',
						'</span>',
						'<span class="module-title-wrap">',
							'{instance.title}',
						'</span>',
					'</div>',
				'</tpl>',
			'</div>'
		);
	},
	
	initLauncherView: function() {
		this.launcher = Ext.create('Ext.view.View', {
			store: this.moduleStore,
			tpl: this.launcherTpl,
			itemSelector: 'div.module-item',
			overItemCls: 'module-hover',
			trackOver: true,
			selectedItemCls: 'module-selected'
		});
		
		this.launcher.on('itemclick', function(view, record, el, index, e, options) {
			record.data.instance.onLauncherClick();
		}, this);
		
		this.launcher.on('itemdblclick', function(view, record, el, index, e, options) {
			record.data.instance.onLauncherDblClick();
		}, this);
		
		this.west.add(this.launcher);
	},
	
	registerModule: function(cls) {
		if (typeof cls != 'string') {
			var numCls = cls.length;
			for (var i = 0; i < numCls; i++) {
				this.registerModule(cls[i]);
			}
			return;
		}
		
		var record = this.getModule(cls);
		if (record != null) {
			return false;
		}
		try {
			var module = Ext.create(cls, {
				application: this
			});
			if (module.name != null) {
				this.moduleStore.add({
					instance: module,
					cls: cls,
					name: module.name
				});
				return module;
//				this.fireEvent('registermodule', this, module.name, module);
			}
		}
		catch(e) {
			console.warn(cls + ' does not exist');
		}
		
		return false;
	},
	
	getModule: function(cls) {
		return this.moduleStore.findRecord('cls', cls);
	},
	
	/**
     * Adds a javascript file to the dom
	 * @param {String} src path to the file
     */
	addJs: function(src) {
		var needToAdd = true;
		Ext.select('script').each(function(el) {
			if (el.dom.src.replace(src, '') != el.dom.src) {
				needToAdd = false;
			}
		});
		if (needToAdd) {
			var newEl = Ext.core.DomHelper.append(Ext.getDoc().down('head'), {
				tag:'script',
				type:'text/javascript',
				src:src
			});
			return newEl;
		}
		else {
			return false;
		}
	},
	
	/**
     * Adds a css file to the dom
	 * @param {String} href path to the file
     */
	addCss: function(href) {
		if (href == null) {
			return false;
		}
		var needToAdd = true;
		Ext.select('link').each(function(el) {
			if (el.dom.href.replace(href, '') != el.dom.href) {
				needToAdd = false;
			}
		});
		if (needToAdd) {
			var newEl = Ext.core.DomHelper.append(Ext.getDoc().down('head'), {
				tag:'link',
				type:'text/css',
				rel: 'stylesheet',
				href:href
			});
			return newEl;
		}
		else {
			return false;
		}
	},
	
	onModuleReady: function(name, callback, scope, options) {
//		if(scope == null){
//			scope = this;
//		}
//		if(options == null){
//			options = {};
//		}
//		
//		if(this.getModule(name)){
//			Ext.bind(callback, scope)(this.getModule(name), options);
//		}
//		else{
//			this.on('registermodule', function(application, name, module, options){
//				if(name == options.name){
//					Ext.bind(options.callback, options.scope)(module, options.options);
//				}
//			}, this, {name: name, callback: callback, scope: scope, options: options});
//		}
	},
	
	/**
	 * This will really be generated on the backend
	 */
	loadModules: function() {
		var clsNames = [
			'Modules.template.js.Template',
			'Modules.scrape.js.Scrape',
			'Modules.navigation.js.Navigation',
			'Modules.page.js.Page',
			'Modules.psd.js.Psd',
			'Modules.redirect.js.Redirect',
			'Modules.scrape.js.Scrape',
			'Modules.wes.js.Wes'
		];
		this.registerModule(clsNames);
	}
});