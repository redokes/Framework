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
	config:{},
	
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
	register: function(service){
		if(Ext.isArray(service)){
			Ext.each(service, this.register, this);
			return;
		}
		
		//Check if this record already exists
		var record = this.get(cls);
		if (record != null) {
			console.warn(this.self.getName() + ' - ' + record.get('instance').self.getName() + ' is already registered');
			return false;
		}
		
		//Try to load the service
		try {
			var instance = Ext.create(service, {
				manager: this
			});
			if (instance.getName() != null) {
				this.store.add({
					instance: instance,
					cls: service,
					name: service.getName(),
					title: service.getTitle()
				});
				return instance;
			}
		}
		catch(e) {
			console.warn(service + ' does not exist');
		}
		return false;
	},
	
	get: function(value, field){
		if(field == null){
			field = 'name';
		}
		return this.store.findRecord(field, value);
	}
});