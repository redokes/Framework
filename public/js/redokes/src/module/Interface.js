Ext.define('Redokes.module.Interface', {
	extend: 'Ext.panel.Panel',
	
	layout: 'card',
	
	config: {
		viewCls: null,
		titleButtons: [],
		module: null
	},
	
	view: null,
	
	constructor: function(config) {
		this.initConfig(config);
		return this.callParent(arguments);
	},
	
	initComponent: function() {
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		
		this.initView();
		this.initBreadcrumb();
		this.init();
		this.initListeners();
		
		this.callParent(arguments);
	},
	
	initView: function() {
		this.view = Ext.create(this.getViewCls());
		this.items.push(this.view);
	},
	
	initBreadcrumb: function() {
		this.breadcrumb = Ext.create('Redokes.module.Breadcrumb', {
			moduleInterface: this
		});
		this.dockedItems.push(this.breadcrumb);
	},
	
	initTitle: function() {
		this.setTitle('<img src="' + this.module.icon.small + '" />' + this.module.title);
	},
	
	initTitleButtons: function() {
		var numButtons = this.titleButtons.length;
		var button;
		for (var i = 0; i < numButtons; i++) {
			button = Ext.create('Ext.button.Button', {
				scope: this,
				text: this.titleButtons[i].text,
				viewCls: this.titleButtons[i].viewCls,
				handler: function(button) {
					// TODO: make this not create a new class if it has already been created
					// Or else delete the old one and add a new instance
					var view = Ext.create(button.viewCls);
					this.add(view); // or don't add it id it is already created
					this.breadcrumb.addCrumb(view.title, view);
				}
			})
			this.header.add(button);
		}
	},
	
	init: function() {
		
	},
	
	initListeners: function() {
		this.on('afterrender', function() {
			this.initTitle();
			this.initTitleButtons();
		}, this);
	}
	
});