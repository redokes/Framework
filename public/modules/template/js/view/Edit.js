Ext.define('Modules.template.js.view.Edit', {
	extend: 'Ext.tab.Panel',
	record: null,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initForm();
		this.initPreview();
	},
	
	initForm: function() {
		this.form = Ext.create('Modules.template.js.form.Template', {
			record: this.record,
			title: 'Settings'
		});
		this.items.push(this.form);
	},
	
	initPreview: function() {
		this.preview = Ext.create('Modules.template.js.view.Preview', {
			title: 'Preview',
			url: this.record.data.url,
			record: this.record
		});
		this.items.push(this.preview);
	}
	
});