Ext.define('Redokes.sprite.Animation', {
	extend:'Ext.util.Observable',
	
	title:false,
	sequence:[],
	fpf:1,
	
	constructor: function(params) {
		d('Animation constructor');
		Ext.apply(this, params);
	}
	
});