Ext.define('Modules.files.js.file.File', {
	extend: 'Ext.util.Observable',
	
	//Config
	remote: false,
	file: null,
	reader: null,
	chunkSize: 65536,	//1024*64
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
		//this.initHandler();
	},
	
	initFile: function(){
		this.chunks = [];
		this.chunkOffsets = [];
		this.totalChunks = Math.ceil(this.file.size / this.chunkSize);
		for(var i = 0; i <= this.file.size; i += this.chunkSize){
			this.chunkOffsets.push(i);
		}
	},
	
	initReader: function(){
		this.reader = new FileReader();
		this.reader.onloadend = Ext.bind(function(e) {
			if (e.target.readyState == FileReader.DONE) { // DONE == 2
				this.fireEvent('chunk', e, e.target.result);
			}
		}, this);
	},
	
	initHandler: function(){
		Ext.create('Redokes.socket.client.Handler', {
			scope: this,
			client: this.application.getSocketClient(),
			module: 'file',
			actions: {
				receive: function(handler, response){
					console.log('receive file');
				}
			}
		});
	},
	
	download: function(){
		this.chunks = [];
		this.currentChunk = 0;
		this.on('chunk', this.onDownloadChunk, this);
		this.downloadChunk(this.currentChunk);
	},
	
	onDownloadChunk: function(event, data, options){
		this.chunks[this.currentChunk] = data;
		this.currentChunk++;
		//Check if we are finished
		if(this.currentChunk >= this.totalChunks){
			this.un('chunk', this.onDownloadChunk, this);
			this.fireEvent('complete', this, this.chunks.join(''));
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