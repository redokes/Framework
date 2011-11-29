Ext.define('Modules.template.js.view.Edit', {
	extend: 'Ext.tab.Panel',
	record: null,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.addEvents('success');
		
		this.initForm();
		this.initPreview();
		this.initListeners();
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
	},
	
	initListeners: function() {
		this.form.on('success', function(form, action) {
			
			var response = action.result;
			var record = response.record;
			this.ownerCt.setTitle(record.title);
			console.log(record.thumb);
			this.form.thumb.setSrc(record.thumb);
			
			this.fireEvent('success', form, action);
		}, this);
	}
	
});