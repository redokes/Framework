Ext.define('Modules.files.js.file.File', {
	extend: 'Ext.util.Observable',
	
	//Config
	file: null,
	reader: null,
	chunkSize: 262144,	//256kb
	chunks: [],
	chunkOffsets: [],
	totalChunks: 0,
	currentChunk: 0,

	constructor: function(file, config){
		Ext.apply(this, file);
		this.file = file;
		this.callParent([config]);
		this.init();
	},

	init: function(){
		this.initFile();
		this.initReader();
	},
	
	initFile: function(){
		this.chunks = [];
		this.chunkOffsets = [];
		this.totalChunks = Math.ceil(this.file.size / this.chunkSize);
		for(var i = 0; i <= this.file.size;){
			this.chunkOffsets.push(i);
			i += (this.chunkSize);
		}
	},
	
	initReader: function(){
		this.reader = new FileReader();
		this.reader.onloadend = Ext.bind(function(e) {
			if (e.target.readyState == FileReader.DONE) { // DONE == 2
				this.fireEvent('chunk', e);
			}
		}, this);
	},
	
	download: function(){
		this.chunks = [];
		this.currentChunk = 0;
		this.on('chunk', this.onDownloadChunk, this);
		this.downloadChunk(this.currentChunk);
	},
	
	onDownloadChunk: function(event, options){
		this.chunks[this.currentChunk] = event.target.result;
		this.currentChunk++;
		//Check if we are finished
		if(this.currentChunk >= this.totalChunks){
			this.un('chunk', this.onDownloadChunk, this);
			this.fireEvent('complete', this, this.chunks.join(''));
			//var audio = document.createElement('audio');
			//document.body.appendChild(audio);
			//audio.src = 'data:' + this.file.type + ';base64,' + window.btoa(this.chunks.join(''));
			//audio.play();
		}
		
		//Keep downloading
		else{
			this.initReader();
			this.downloadChunk(this.currentChunk);
		}
	},
	
	downloadChunk: function(chunkIndex){
		var blob = this.file.webkitSlice(this.chunkOffsets[chunkIndex], this.chunkOffsets[chunkIndex] + this.chunkSize);
		this.reader.readAsBinaryString(blob);
	}
});