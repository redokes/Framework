Ext.define('Redokes.module.Breadcrumb', {
	extend: 'Ext.toolbar.Toolbar',
	dock: 'top',
	
	moduleInterface: null,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initHomeButton();
	},
	
	initHomeButton: function() {
		this.addCrumb(this.moduleInterface.view, 'Home');
	},
	
	clearAfter: function(button) {
		// Clear out anything after this in the breadcrumb
		var numItems = this.items.length;
		for (var i = numItems-1; i >= 0; i--) {
			if (this.items.items[i] != button) {
				// Get rid of it
				this.items.items[i].destroy();
			}
			else {
				console.log('else');
//				this.moduleInterface.setView(button.view);
				break;
			}
		}
	},
	
	setCrumb: function(crumb) {
		this.clearAfter(crumb);
		this.moduleInterface.setView(crumb.view);
	},
	
	addCrumb: function(view, text) {
		text = text || view.title;
		
		// Make sure crumb isn't in list already
		// If in list, set active
		var numItems = this.items.length;
		var items = this.items.items;
		for (var i = 0; i < numItems; i++) {
			if (items[i].view == view) {
				return items[i];
			}
		}
		
		var crumb = Ext.create('Redokes.module.Crumb', {
			scope: this,
			text: text,
			view: view,
			breadcrumb: this,
			handler: this.setCrumb
		});
		
		var divider = Ext.create('Ext.button.Button', {
			text: '&gt;&gt;'
		});
		
		if (this.rendered) {
			if (this.items.length) {
				this.add(divider);
			}
			this.add(crumb)
		}
		else {
			if (this.items.length) {
				this.items.push(divider);
			}
			this.items.push(crumb);
		}
		
		if (this.items.length > 1) {
			this.moduleInterface.setView(view);
		}
		
		return crumb;
	}
	
});