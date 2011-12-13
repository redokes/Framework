Ext.define('Redokes.module.Manager', {
	extend: 'Ext.util.Observable',
	
	///////////////////////////////////////////////////////////////////////////
	// Requires
	///////////////////////////////////////////////////////////////////////////
	requires:[
		'Redokes.module.model.Module'
	],
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	config:{
		os: null,
		store: null
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Inits
	///////////////////////////////////////////////////////////////////////////
	constructor: function(config){
		this.initConfig(config);
		this.callParent(arguments);
		this.init();
	},
	
	init: function(){
		this.initStore();
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			model: 'Redokes.module.model.Module'
		});
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	register: function(cls) {
		if (typeof cls != 'string') {
			var numCls = cls.length;
			for (var i = 0; i < numCls; i++) {
				this.register(cls[i]);
			}
			return;
		}
		
		var record = this.get(cls, 'cls');
		if (record != null) {
			return false;
		}
		try {
			var module = Ext.create(cls, {
				manager: this,
				os: this.getOs()
			});
			module.on('launch', this.onLaunch, this);
			module.on('quit', this.onQuit, this);
			
			if (module.name != null) {
				this.store.add({
					instance: module,
					cls: cls,
					name: module.getName(),
					title: module.getTitle()
				});
				return module;
			}
		}
		catch(e) {
			console.warn(cls + ' does not exist');
		}
		return false;
	},
	
	get: function(value, field) {
		if(field == null){
			field = 'name'
		}
		return this.store.findRecord(field, value);
	},
	
	/**
     * A special listener/function that allows you to listen for when a module
	 * has launched. Much like Ext.onReady
     * @param {String} name Name of the module to listen for
     * @param {Function} callback Function to run when the module has launched
	 * @param {Object} scope Scope to run the callback function in
	 * @param {Object} options Any additional options to pass to the callback function
     */
	onModuleLaunch: function(name, callback, scope, options){
		if(scope == null){
			scope = this;
		}
		if(options == null){
			options = {};
		}
		
		if(this.get(name)){
			Ext.bind(callback, scope)(this.get(name).get('instance'), options);
		}
		else{
			this.on('launch', function(manager, module, options){
				if(name == options.name){
					Ext.bind(options.callback, options.scope)(module, options.options);
				}
			}, this, {name: name, callback: callback, scope: scope, options: options});
		}
	},
	
	/**
     * Fired when a module launches and fires its launch event
	 */
	onLaunch: function(module) {
		this.fireEvent('launch', this, module);
	},
	
	/**
     * Fired when a module quits and fires its quit event
	 */
	onQuit: function(module) {
		this.fireEvent('quit', this, module);
	}
});