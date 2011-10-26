Ext.define('Modules.files.js.music.Player', {
	extend:'Ext.toolbar.Toolbar',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	lastVolume: 0,
	isPaused: true,
	isLoaded: false,
	
	initComponent: function(){
		this.showLog();
		this.items = this.items || [];
		this.initButtons();
		this.callParent(arguments);
	},
	
	initButtons: function() {
		this.playButton = Ext.create('Ext.button.Button', {
			text: 'Play',
			scope: this,
			handler: this.play
		});
		this.items.push(this.playButton);
		
		this.pauseButton = Ext.create('Ext.button.Button', {
			text: 'Pause',
			scope: this,
			handler: this.pause
		});
		this.items.push(this.pauseButton);
		
		this.previousButton = Ext.create('Ext.button.Button', {
			text: 'Previous',
			scope: this,
			handler: this.previous
		});
		this.items.push(this.previousButton);
		
		this.nextButton = Ext.create('Ext.button.Button', {
			text: 'Next',
			scope: this,
			handler: this.next
		});
		this.items.push(this.nextButton);
		
		this.stopButton = Ext.create('Ext.button.Button', {
			text: 'Stop',
			scope: this,
			handler: this.stop
		});
		this.items.push(this.stopButton);
		
	},
	
	setRawSrc: function(type, data){
		this.audio.dom.src = 'data:' + type + ';base64,' + window.btoa(data);
	},
	
	play: function() {
		this.log('Play');
		if (this.isLoaded) {
			this.audio.dom.play();
			this.isPaused = false;
		}
	},
	
	stop: function() {
		this.log('Stop');
		if (this.isLoaded) {
			this.audio.dom.pause();
			this.seek(0);
		}
	},
	
	pause: function() {
		this.log('Pause');
		if (this.isLoaded) {
			if (this.isPaused) {
				this.isPaused = false;
				this.audio.dom.pause();
			}
			else {
				this.isPaused = true;
				this.audio.dom.play();
			}
		}
	},
	
	previous: function() {
		this.log('Previous');
	},
	
	next: function() {
		this.log('Next');
	},
	
	setVolume: function(volume) {
		this.log('Set volume ' + volume);
		this.audio.dom.volume = volume;
	},
	
	mute: function() {
		this.oldVolume = this.audio.dom.volume;
		this.audio.dom.volume = 0;
	},
	
	unmute: function() {
		this.audio.dom.volume = this.oldVolume;
	},
	
	seek: function(seconds) {
		if (this.isLoaded) {
			this.audio.dom.currentTime = seconds;
		}
	},
	
	//Init Functions
	onRender: function(){
		this.callParent(arguments);
		this.audio = Ext.getBody().createChild({
			tag: 'audio',
			controls: true
		});
	}
});