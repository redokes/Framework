Ext.define('Redokes.module.Viewable', {
	extend: 'Redokes.module.Module',
	
	config: {
		viewCls: null
	},
	
	view: null,
	
	initView: function() {
		if (this.getViewCls() !== null) {
			this.view = Ext.create(this.getViewCls());
		}
	},
	
	onBeforeLaunch: function() {
		this.initView();
	}
	
});