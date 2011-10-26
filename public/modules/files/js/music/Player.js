Ext.define('Modules.files.js.music.Player', {
	extend:'Ext.toolbar.Toolbar',
	
	lastVolume: 0,
	isPaused: true,
	
	initComponent: function(){
		this.items = [];
		this.callParent(arguments);
	},
	
	setRawSrc: function(type, data){
		this.audio.dom.src = 'data:' + type + ';base64,' + window.btoa(data);
	},
	
	play: function(){
		this.audio.dom.play();
		this.isPaused = false;
	},
	
	stop: function() {
		this.audio.dom.pause();
		this.audio.dom.seek(0);
	},
	
	pause: function() {
		if (this.isPaused) {
			this.isPaused = false;
			this.audio.dom.pause();
		}
		else {
			this.isPaused = true;
			this.audio.dom.play();
		}
	},
	
	setVolume: function(volume) {
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
		this.audio.dom.currentTime = seconds;
	},
	
	//Init Functions
	onRender: function(){
		this.callParent(arguments);
		this.audio = this.body.createChild({
			tag: 'audio',
			controls: true
		});
	}
});