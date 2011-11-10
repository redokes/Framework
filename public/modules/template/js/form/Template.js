Ext.define('Modules.template.js.form.Template', {
	extend: 'Redokes.form.Abstract',
	
	templateId: 0,
	record: null,
	bodyPadding: '10px',
	url: '/template/template/submit',
	layout: 'hbox',
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initColumns();
		this.initThumb();
		this.initTitleField();
		this.initHiddenField();
		
		if (this.record && this.record.get('templateId')) {
			this.initTemplateFile();
			this.initResourceFile();
		}
		
		this.initButtons();
		this.initListeners();
	},
	
	initColumns: function() {
		this.leftColumn = Ext.create('Ext.panel.Panel', {
			border: 0,
			frame: false,
			width: 120
		})
		this.rightColumn = Ext.create('Ext.panel.Panel', {
			border: 0,
			frame: false,
			flex: 1
		})
		this.items.push(this.leftColumn, this.rightColumn);
	},
	
	initThumb: function() {
		var src = false;
		if (this.record) {
			src = this.record.get('thumb');
		}
		this.thumb = Ext.create('Ext.Img', {
			src: src,
			width: 100,
			height: 100
		});
		this.leftColumn.add(this.thumb);
	},
	
	initTitleField: function() {
		this.titleField = Ext.create('Ext.form.field.Text', {
			fieldLabel: 'Title',
			name: 'title'
		});
		this.rightColumn.add(this.titleField);
	},
	
	initHiddenField: function() {
		this.hiddenField = Ext.create('Ext.form.field.Hidden', {
			name: 'templateId'
		});
		this.rightColumn.add(this.hiddenField);
	},
	
	initTemplateFile: function() {
		this.templateFile = Ext.create('Ext.form.field.File', {
			fieldLabel: 'File',
			name: 'file'
		});
		this.rightColumn.add(this.templateFile);
	},
	
	initResourceFile: function() {
		this.resourceFile = Ext.create('Ext.form.field.File', {
			fieldLabel: 'Resources',
			name: 'resource'
		});
		this.rightColumn.add(this.resourceFile);
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