Ext.define('Redokes.os.OS', {
	extend: 'Ext.util.Observable',
    singleton: true,
	
	config: {
		
	},
	
	modules: false,
	
	constructor: function(config) {
		this.initConfig(config);
		this.init();
		return this.callParent(arguments);
	},
	
	init: function() {
		this.initModuleStore();
		this.initApplication();
		this.loadModules();
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
	
	initApplication: function() {
		
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
					name: module.name,
					title: module.title
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
	
	launchModule: function(module) {
		this.application.launchModule(module);
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
	
	/**
	 * This will really be generated on the backend
	 */
	loadModules: function() {
		this.onModuleLoad();
		return;
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
		Ext.require(clsNames, function() {
			this.registerModule(clsNames);
		}, this);
	},
	
	onModuleLoad: function() {
		console.log('Modules loaded');
		
	}
});