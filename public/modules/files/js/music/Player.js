Ext.define('Modules.files.js.music.Player', {
	extend:'Ext.Component',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	//Render Template
	renderTpl:
        '<div class="audio-player {cls}">' +
			'<audio preload="false"></audio>' +
			'<div class="play-pause play"></div>' +
			'<div class="progress-container">' +
				'<div class="loader" style="">' +
					'<div class="progress" style=""></div>' +
				'</div>' +
			'</div>' +
			'<div class="text"></div>' +
			'<div class="time"></div>' + 
			'<div class="previous"></div>' + 
			'<div class="next"></div>' +
			'<div class="clear"></div>' +
		'</div>',
	
	//Elements to get after render
	renderSelectors: {
        audio: 'audio',
        playPauseEl: '.play-pause',
        progressContainerEl: '.progress-container',
        loaderEl: '.progress-container .loader',
        progressEl: '.progress-container .progress',
        textEl: '.text',
        timeEl: '.time',
        previousEl: '.previous',
        nextEl: '.next'
    },
	
	//Properties
	isLoaded: false,
	isPlaying: false,
	isPaused: false,
	
	onRender: function(){
		this.callParent(arguments);
		this.initAudio();
		this.initPlayPause();
	},
	
	initAudio: function(){
		this.audio.on('progress', this.onProgress, this);
		this.audio.on('timeupdate', this.onTimeUpdate, this);
		this.audio.on('ended', this.onEnded, this);
		this.progressContainerEl.on('click', this.onProgressClick, this);
	},
	
	initPlayPause: function(){
		this.playPauseEl.on('click', this.onPlayPauseClick, this);
	},
	
	initPlaylist: function() {
		this.playlist = Ext.create('Modules.files.js.music.Playlist', {
			title: 'Playlist'
		});
		
		this.items.push(this.playlist);
	},
	
	setText: function(tags){
		this.textEl.update(tags.artist + ' - ' + tags.title);
	},
	
	setRawSrc: function(type, data){
		this.stop();
		this.audio.dom.src = '';
		//this.audio.dom.src = 'data:' + type + ';base64,' + window.btoa(data);
		this.audio.dom.src = data;
		this.isLoaded = true;
	},
	
	setSrc: function(src){
		this.stop();
		this.audio.dom.src = '';
		this.audio.dom.src = src;
		this.isLoaded = true;
	},
	
	play: function(record) {
		if(record != null){
			this.stop();
			var file = Ext.create('Modules.files.js.file.File', record.get('file'));
			file.getTags(function(file, tags, options){
				file.getURL(function(url){
					this.setSrc(url);
					this.setText(tags);
					this.play();
				}, this);
			}, this);
			return;
		}
		
		//Make sure we are loaded and not already playing
		if(!this.isLoaded || this.isPlaying){
			return;
		}
		
		this.log('Play');
		this.audio.dom.play();
		this.playPauseEl.removeCls('play');
		this.playPauseEl.addCls('pause');
		this.isPlaying = true;
		this.isPaused = false;
	},
	
	stop: function() {
		if(!this.isLoaded || !this.isPlaying){
			return;
		}
		
		this.log('Stop');
		this.seek(0);
		this.audio.dom.pause();
		this.isPlaying = false;
		this.isPaused = false;
	},
	
	pause: function() {
		if(!this.isLoaded || !this.isPlaying || this.isPaused){
			return;
		}
		
		this.log('Pause');
		this.playPauseEl.removeCls('pause');
		this.playPauseEl.addCls('play');
		this.audio.dom.pause();
		this.isPaused = true;
		this.isPlaying = false;
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
	
	//Events
	onProgress: function(){
		var loaded = parseInt(((this.audio.dom.buffered.end(0) / this.audio.dom.duration) * 100), 10);
		this.loaderEl.setWidth(loaded + "%");
	},
	
	onTimeUpdate: function(){
		var currentTime = parseInt(this.audio.dom.currentTime, 10);
		var totalTime = parseInt(this.audio.dom.duration, 10);
		var totalMinutes = Math.floor(totalTime/60, 10);
		var totalSeconds = totalTime - totalMinutes * 60;
		var currentMinutes = Math.floor(currentTime/60, 10);
		var currentSeconds = currentTime - currentMinutes * 60;
		var remainingMinutes = Math.floor((totalTime - currentTime)/60, 10);
		var remainingSeconds = (totalTime-currentTime) - remainingMinutes * 60;
		
		var percentage = (this.audio.dom.currentTime / this.audio.dom.duration) * 100;
		
		//Update the progress
		this.progressEl.setWidth(percentage + "%");
		
		//Update the text
		this.timeEl.update("-" + remainingMinutes + ':' + (remainingSeconds > 9 ? remainingSeconds : '0' + remainingSeconds));
	},
	
	onEnded: function(){
		this.fireEvent('complete', this);
	},
	
	onProgressClick: function(event){
		var eventX = event.getX();
		var elX = this.progressEl.getX();
		var elWidth = this.progressContainerEl.getWidth(true);
		var duration = ((eventX - elX) / elWidth) * this.audio.dom.duration;
		this.audio.dom.currentTime = duration;
	},
	
	onPlayPauseClick: function(){
		if(!this.isLoaded){
			return;
		}
		
		if(this.isPlaying){
			this.pause();
		}
		else{
			this.play();
		}
	}
});