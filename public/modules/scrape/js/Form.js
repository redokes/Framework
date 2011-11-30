Ext.define('Modules.scrape.js.Form', {
	extend: 'Redokes.form.Abstract',
	
	//Config
	processingPage: '/scrape/process/',
	url: '/scrape/process/',
	processAction: 'process',
	loadRowAction: 'load-row',
	showFailureMessage: false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initUrl();
		this.initDepth();
		this.initHidden();
		this.initButtons();
	},
	
	initUrl: function(){
		this.urlField = Ext.create('Ext.form.field.Text', {
			fieldLabel: 'URL',
			name:'url'
		});
		this.items.push(this.urlField);
	},
	
	initDepth: function(){
		this.depthBox = Ext.create('Ext.form.field.ComboBox', {
			value: 0,
			editable: false,
			emptyText: 'Options...',
			triggerAction: 'all',
			mode: 'local',
			store: new Ext.data.ArrayStore({
				id: 0,
				fields: [
					'value',
					'text'
				],
				data: [
					[0, 'Single Page'],
					[-1, 'Full Site']
				]
			}),
			valueField: 'value',
			displayField: 'text',
			name: 'depth',
			anchor: '100%'
		});
		
		this.items.push(this.depthBox);
	},
	
	initHidden: function(){
		this.items.push({
			xtype: 'hidden',
			name: 'scrapeId',
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
	}
});