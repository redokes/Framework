Ext.define('Modules.psd.js.Form', {
	extend: 'Redokes.form.Abstract',
	
	url: '/psd/private/process',
	record: false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initTitle();
		this.initFile();
		this.initHidden();
		
		this.initButtons();
		this.initListeners();
	},
	
	initTitle: function() {
		this.titleField = Ext.create('Ext.form.field.Text', {
    		fieldLabel: 'Title',
    		name:'title'
    	});
		this.items.push(this.titleField);
    },
    
    initFile: function() {
		this.fileField = Ext.create('Ext.form.field.File', {
			fieldLabel: 'File',
			name: 'file'
		});
		this.items.push(this.fileField);
    },
    
    initHidden: function() {
    	this.items.push({
    		xtype: 'hidden',
        	name: 'psdId',
        	value: 0
    	});
    },
	
	initButtons: function() {
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