Ext.define('Redokes.module.Viewable', {
	extend: 'Redokes.module.Module',
	
	config: {
		viewCls: null
	},
	
	view: null,
	isViewable: true,
	
	initListeners: function() {
		this.on('before-launch', this.initView, this);
		this.on('before-launch', this.handleLaunchParams, this);
	},
	
	initView: function() {
		if (this.getViewCls() !== null && this.view === null) {
			this.view = Ext.create(this.getViewCls());
			this.view.on('show', this.onShow, this);
		}
	},
	
	getView: function() {
		if (this.view === null) {
			this.initView();
		}
		return this.view;
	},
	
	onShow: function() {
		console.log('on show');
		
	}
	
});