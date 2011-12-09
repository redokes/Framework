Ext.define('Redokes.module.Module', {
	extend: 'Ext.util.Observable',
	
	config: {
		name: null,
		title: '',
		viewClass: null,
		application: null,
		css: false,
		iconSmall: false,
		iconMedium: false,
		iconLarge: false,
		
		// remove these later when we have a real default
		iconSmall: '/modules/template/resources/img/template-16.png',
		iconMedium: '/modules/template/resources/img/template-32.png',
		iconLarge: '/modules/template/resources/img/template-128.png'
	},
	
	view: null,
	
	constructor: function(config) {
		this.initConfig(config);
		//Make sure there is a name
		if(this.getName() == null){
			console.warn('[' + this.self.getName() + ']' + ' - Please set a name for this module');
		}
		
		//Call the parent
		return this.callParent(arguments);
	},
	
	launchModule: function() {
		// Make sure this view has been made
		if (this.view == null) {
			this.view = Ext.create(this.viewClass);
			this.getApplication().addCss(this.getCss());
			this.getApplication().center.add(this.view);
		}
		this.getApplication().center.getLayout().setActiveItem(this.view);
	},
	
	onLauncherClick: function() {
		this.launchModule();
	},
	
	onLauncherDblClick: function() {
		
	}
	
});