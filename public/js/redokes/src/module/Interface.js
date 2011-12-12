Ext.define('Redokes.module.Interface', {
	extend: 'Ext.panel.Panel',
	
	layout: 'card',
	
	config: {
		viewCls: null,
		titleButtons: [],
		module: null
	},
	
	view: null,
	activeViews: [],
	
	constructor: function(config) {
		this.activeViews = [];
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
		this.view = this.addView(Ext.create(this.getViewCls()));
	},
	
	setView: function(view) {
		console.log('set view');
		
		// Make sure this view is added before setting it as active
		var existingView = this.getView(view);
		if (existingView === false) {
			console.log('no exiting view so add a new one');
			this.addView(view);
		}
		else {
			view = existingView;
			console.log('found a view');
		}
//		this.breadcrumb.addCrumb(view);
		this.getLayout().setActiveItem(view);
	},
	
	switchView: function(view) {
		this.setView(view);
		console.log('switch view ' + Ext.getClassName(view));
//		this.breadcrumb.setCrumb(view);
	},
	
	addView: function(view) {
		if (typeof view == 'string') {
			view = Ext.create(view);
		}
		console.log('add view ' + Ext.getClassName(view));
		this.activeViews.push(view);
		if (this.rendered) {
			this.add(view);
		}
		else {
			this.items.push(view);
		}
		return view;
	},
	
	getView: function(view) {
		console.log('find view');
		console.log(view);
		var numViews = this.activeViews.length;
		var lookupCls = Ext.getClassName(view);
		console.log('looking up ' + lookupCls);
		for (var i = 0; i < numViews; i++) {
			console.log('compare ' + Ext.getClassName(this.activeViews[i]));
			if (lookupCls == Ext.getClassName(this.activeViews[i])) {
				console.log('found existing so set it');
				return this.activeViews[i];
			}
		}
		return false;
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
				view: null,
				handler: function(button) {
					// Make the view if it doesn't already exist
					if (button.view === null) {
						button.view = Ext.create(button.viewCls);
					}
					var crumb = this.breadcrumb.addCrumb(button.view);
					crumb.onClick();
				}
			});
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