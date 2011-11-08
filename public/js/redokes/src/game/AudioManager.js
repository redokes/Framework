Ext.define('Redokes.game.AudioManager', {
	extend: 'Ext.util.Observable',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	files: {},
	bgSound: false,
	fxSound: false,
	
	forceLoad: false,
	
	constructor: function() {
		this.addEvents('load');
		this.files = {};
		this.init();
		this.callParent(arguments);
	}
	
});