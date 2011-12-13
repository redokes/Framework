Ext.define('Redokes.service.Service', {
	extend: 'Ext.util.Observable',
	
	///////////////////////////////////////////////////////////////////////////
	// Config
	///////////////////////////////////////////////////////////////////////////
	config: {
		name: null,
		title: '',
		os: null,
		manager: null,
		autoStart: true
	},
	
	///////////////////////////////////////////////////////////////////////////
	// Properties
	///////////////////////////////////////////////////////////////////////////
	running: false,
	
	persistentEvents: null,
	
	///////////////////////////////////////////////////////////////////////////
	// Init Functions
	///////////////////////////////////////////////////////////////////////////
	constructor: function(config) {
		this.initConfig(config);
		
		this.persistentEvents = Ext.create('Ext.util.MixedCollection');
		this.persistentEvents.addAll([
			'start',
			'stop'
		]);
		
		this.callParent(arguments);
		this.addEvents('start', 'stop');
		
		// Make sure there is a name
		if (this.getName() == null) {
			console.error('[' + this.self.getName() + ']' + ' - Please set a name for this service');
		}
		
		this.init();
	},
	
	init: function() {},
	
	
	///////////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////////
	checkAutoStart: function() {
		if(this.getAutoStart()){
			this.start();
		}
	},
	
	start: function(){
		if (this.isRunning()) {
			return false;
		}
		
		console.log(this.self.getName() + ' - start');
		this.running = true;
		this.fireEvent('start', this);
	},
	
	stop: function(){
		if (!this.isRunning()) {
			return false;
		}
		
		console.log(this.self.getName() + ' - stop');
		this.running = false;
		this.fireEvent('stop', this);
		this.clearListeners();
	},
	
	fireEvent: function() {
		if (this.isRunning()) {
			this.callParent(arguments);
		}
	},
	
	clearListeners: function() {
        var events = this.events,
            event,
            key;

        for (key in events) {
            if (events.hasOwnProperty(key)) {
                event = events[key];
                if (event.isEvent && !this.persistentEvents.contains(key)) {
                    event.clearListeners();
                }
            }
        }

        this.clearManagedListeners();
    },
	
	///////////////////////////////////////////////////////////////////////////
	// Checkers
	///////////////////////////////////////////////////////////////////////////
	isRunning: function() {
		return this.running;
	}
});