Ext.define('Modules.files.js.music.Playlist', {
	extend:'Ext.view.View',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	initComponent: function(){
		this.showLog();
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initTpl();
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			fields: [
				'id',
				'content',
				'name',
				'size',
				'type'
			]
		});
	},
	
	initTpl: function() {
		this.tpl = Ext.create('Ext.XTemplate', 
			'<tpl for=".">',
				'<div class="playlist-item-wrap">',
				  '<span>{name}</span>',
				'</div>',
			'</tpl>'
		);
	}
	
});