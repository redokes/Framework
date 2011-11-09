Ext.define('Modules.template.js.form.Template', {
	extend: 'Redokes.form.Abstract',
	
	templateId: 0,
	record: null,
	bodyPadding: '10px',
	url: '/template/template/submit',
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitleField();
		this.initHiddenField();
		
		if (this.record && this.record.get('templateId')) {
			this.initTemplateFile();
			this.initResourceFile();
		}
		
		this.initButtons();
		this.initListeners();
	},
	
	initTitleField: function() {
		this.titleField = Ext.create('Ext.form.field.Text', {
			fieldLabel: 'Title',
			name: 'title'
		});
		this.items.push(this.titleField);
	},
	
	initHiddenField: function() {
		this.titleField = Ext.create('Ext.form.field.Hidden', {
			name: 'templateId'
		});
		this.items.push(this.titleField);
	},
	
	initTemplateFile: function() {
		this.templateFile = Ext.create('Ext.form.field.File', {
			fieldLabel: 'File',
			name: 'file'
		});
		this.items.push(this.templateFile);
	},
	
	initResourceFile: function() {
		this.resourceFile = Ext.create('Ext.form.field.File', {
			fieldLabel: 'Resources',
			name: 'resource'
		});
		this.items.push(this.resourceFile);
	},
	
	initButtons: function(){
		this.buttons = [{
			scope: this,
			text: 'Submit',
			icon: '/resources/icons/save-16.png',
			cls: 'submit',
			handler: function() {
				this.submit();
			}
		}];
	},
	
	initListeners: function() {
		this.on('afterrender', function() {
			if (this.record !== null) {
				this.loadRecord(this.record);
			}
		}, this);
	}
	
});