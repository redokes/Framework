Ext.define('Modules.template.js.Interface', {
	extend: 'Redokes.tab.Interface',
	
	height: 400,
	width: 600,
	
	tabTitleTemplate: '{title}',
	tabIconCls: 'contact-icon-16',
	tabClass: 'Modules.template.js.form.Template',
	tabModel: 'Modules.template.js.model.Template',
	addFormClass: 'Modules.template.js.form.Template',
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTemplateList();
		this.initListeners();
	},
	
	initTemplateList: function() {
		this.templateList = Ext.create('Modules.template.js.DataView', {
			title: 'Templates'
		});
		this.items.push(this.templateList);
	},
	
	initListeners: function() {
		this.templateList.on('itemdblclick', function(view, record, item, index) {
			this.setActiveTab(this.createTab(record));
		}, this);
	}
	
});