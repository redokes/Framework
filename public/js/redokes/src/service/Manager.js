Ext.define('Redokes.service.Manager', {
	extend: 'Ext.util.Observable',
	
	///////////////////////////////////////////////////////////////////////////
	// Requires
	///////////////////////////////////////////////////////////////////////////
	requires:[
		'Redokes.service.model.Service'
	],
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	config: {
		os: null
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
			model: 'Redokes.service.model.Service'
		});
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	register: function(clsName){
		if(Ext.isArray(clsName)){
			Ext.each(clsName, this.register, this);
			return;
		}
		
		//Check if this record already exists
		var record = this.get(clsName, 'cls');
		if (record != null) {
			console.warn(this.self.getName() + ' - ' + record.get('instance').self.getName() + ' is already registered');
			return false;
		}
		
		//Try to load the service
		try {
			var instance = Ext.create(clsName, {
				manager: this,
				os: this.getOs()
			});
			
			instance.on('start', this.onStart, this);
			instance.on('stop', this.onStop, this);
			
			instance.checkAutoStart();
			
			if (instance.getName() != null) {
				this.store.add({
					instance: instance,
					cls: clsName,
					name: instance.getName(),
					title: instance.getTitle()
				});
				return instance;
			}
		}
		catch(e) {
			console.warn(clsName + ' does not exist');
		}
		return false;
	},
	
	get: function(value, field){
		if(field == null){
			field = 'name';
		}
		return this.store.findRecord(field, value);
	},
	
	/**
     * A special listener/function that allows you to listen for when a service
	 * has started. Much like Ext.onReady
     * @param {String} name Name of the service to listen for
     * @param {Function} callback Function to run when the service has started
	 * @param {Object} scope Scope to run the callback function in
	 * @param {Object} options Any additional options to pass to the callback function
     */
	onServiceStart: function(name, callback, scope, options){
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
			this.on('start', function(manager, service, options){
				if(name == options.name){
					Ext.bind(options.callback, options.scope)(service, options.options);
				}
			}, this, {name: name, callback: callback, scope: scope, options: options});
		}
	},
	
	/**
     * Fired when a service starts and fires its start event
	 */
	onStart: function(service) {
		this.fireEvent('start', this, service);
	},
	
	/**
     * Fired when a service stop and fires its stop event
	 */
	onStop: function(service) {
		this.fireEvent('stop', this, service);
	}
	
});