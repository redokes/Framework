Ext.define('Redokes.os.OS', {
	extend: 'Ext.util.Observable',
    singleton: true,
	
	config: {
		
	},
	
	modules: false,
	
	constructor: function(config) {
		this.initConfig(config);
		this.addEvents('ready');
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
				os: this
			});
			if (module.name != null) {
				this.moduleStore.add({
					instance: module,
					cls: cls,
					name: module.name,
					title: module.title
				});
				console.log('Registered ' + module.name);
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
		console.log('Launch module ' + module.name);
//		this.application.launchModule(module);
	},
	
	getModule: function(cls) {
		return this.moduleStore.findRecord('cls', cls);
	},
	
	/**
	 * This will really be generated on the backend
	 */
	loadModules: function() {
		this.clsNames = [
			'Redokes.module.Test1',
			'Redokes.module.Test2'
		];
		Ext.require(this.clsNames, this.onModuleLoad, this);
	},
	
	onModuleLoad: function() {
		console.log('Modules loaded');
		this.registerModule(this.clsNames);
		this.fireEvent('ready', this);
	}
});