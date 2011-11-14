Ext.define('Modules.files.js.music.playlist.Toolbar', {
	extend:'Ext.toolbar.Toolbar',
	
	//Config
	vertical: true,
	playlist: null,
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initClear();
	},
	
	initClear: function(){
		this.items.push({
			scope: this,
			icon: '/modules/files/images/icons/clear-24.png',
			scale: 'medium',
			tooltip: 'clear',
			handler: function(){
				this.playlist.clear();
			}
		});
	}
});