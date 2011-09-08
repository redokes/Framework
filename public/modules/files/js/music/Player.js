Ext.define('Modules.files.js.music.Player', {
	extend:'Ext.panel.Panel',

	initComponent: function(){
		this.items = [];
		this.callParent(arguments);
	},
	
	setRawSrc: function(type, data){
		this.audio.dom.src = 'data:' + type + ';base64,' + window.btoa(data);
	},
	
	play: function(){
		this.audio.dom.play();
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