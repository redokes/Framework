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
		this.addCrumb('Home', this.moduleInterface.view);
	},
	
	addCrumb: function(text, view) {
		// Make sure crumb isn't in list already
		// If in list, set active
		
		var crumb = Ext.create('Redokes.module.Crumb', {
			scope: this,
			text: text,
			view: view,
			handler: function(button) {
				// Clear out anything after this in the breadcrumb
				var numItems = this.items.length;
				for (var i = numItems-1; i >= 0; i--) {
					if (this.items.items[i] != button) {
						// Get rid of it
						this.items.items[i].destroy();
					}
					else {
						this.moduleInterface.getLayout().setActiveItem(button.view);
						break;
					}
				}
			}
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
			this.moduleInterface.getLayout().setActiveItem(view);
		}
	}
	
});