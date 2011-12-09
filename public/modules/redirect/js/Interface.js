Ext.define('Modules.redirect.js.Interface', {
	extend:'Ext.panel.Panel',
	
	title: 'Redirects',
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
//		this.initGrid();
//		this.initForm();
//		this.initEditForm();
//		this.initSections();
	},

	initGrid: function(){
		this.grid = Ext.create('Modules.redirect.js.Grid', {
			title: 'Redirects',
			iconCls: 'grid-icon'
		});

//		this.grid.on('edit', function(record) {
//			this.setActiveItem(this.editForm, {
//				title: record.data.title
//			});
//			this.editForm.load(record.data.redirectId);
//		}, this);

	},

	initForm: function(){
		this.form = Ext.create('Modules.redirect.js.Form');

		this.form.on('show', function(){
			this.form.reset();
		}, this);
		
	},

	initEditForm: function(){
		this.editForm = Ext.create('Modules.redirect.js.Form');
	}
	
});