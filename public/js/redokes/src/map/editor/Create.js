Ext.define('Redokes.map.editor.Create', {
	extend:'Ext.form.Panel',
	bodyPadding:8,
	url:'/wes/map-process/create',
	action:'/wes/map-process/create',
	
	initComponent: function() {
		this.items = this.items || [];
		this.initFields();
		this.initButtons();
		this.callParent(arguments);
	},
	
	initFields: function() {
		this.titleField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Title',
			name:'title'
		});
		
		this.items.push([
			this.titleField
		]);
	},
	
	initButtons: function() {
		this.buttons = [{
			scope:this,
			text:'Create',
			handler: this.create
		}];
	},
	
	create: function() {
		this.getForm().submit({
			url:this.url,
			success: function(form, response) {
				var response = response.result;
				console.log(response);
			}
		});
	}
});