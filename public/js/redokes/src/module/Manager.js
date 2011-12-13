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
	}
});