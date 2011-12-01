Ext.define('Modules.scrape.js.ImportWizard', {
//	extend: 'Ext.panel.Panel',
//	layout: 'card',
	activeItem: 0,
	extend: 'Ext.tab.Panel',
	record: false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initEditor();
		this.initProgressPanel();
		this.initListeners();
	},
	
	initEditor: function() {
		this.editor = Ext.create('Modules.scrape.js.Form', {
			title: 'Title',
			record: this.record
		});
		this.items.push(this.editor);
	},
	
	initProgressPanel: function() {
		this.progressPanel = Ext.create('Modules.scrape.js.ProgressPanel', {
			title: 'Progress',
			record: this.record
		});
		this.items.push(this.progressPanel);
	},
	
	initListeners: function() {
		this.editor.on('success', function(form, action) {
			this.fireEvent('success', form, action);
			this.progressPanel.show();
			this.progressPanel.start();
		}, this);
	}
});