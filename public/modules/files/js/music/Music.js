/**
 * Music module
 * This is a singleton class and connot be directly created.
 * @extends Modules.files.js.module.Abstract
 * @singleton
 */
Ext.define('Modules.files.js.music.Music', {
	extend:'Modules.files.js.module.Abstract',
	singleton: true,
	
	//Config
	name: 'music',
	displayTitle: 'Music',

	//Init Functions
	init: function(){
		this.initPlayer();
		this.initTree();
	},
	
	initPlayer: function(){
		this.player = Ext.create('Modules.files.js.music.Player', {
			scope: this,
			title: 'Music'
		}, this);
		this.application.getAccordion().add(this.player);
		//this.audio = document.createElement('audio');
		//document.body.appendChild(this.audio);
		//audio.src = 'data:' + this.file.type + ';base64,' + window.btoa(this.chunks.join(''));
		//audio.play();
	},
	
	initTree: function(){
		var user = this.application.getModule('user');
		if(!user){
			this.application.onModuleReady('user', function(user){
				this.initTree();
			}, this);
			return;
		}
		
		user.getTree().on('itemdblclick', function(view, record, item, index){
			console.log(record.raw.file);
			
			var file = Ext.create('Modules.files.js.file.File', record.raw.file);
			file.on('complete', function(file, data){
				this.player.setRawSrc(file.type, data);
				this.player.play();
				
				//Share this on the stream
				var stream = this.application.getModule('stream');
				if(stream){
					stream.addMessage({
						text: 'You are listening to ' + file.fileName
					});
				}
				
			}, this);
			file.download();
		}, this);
	}
});