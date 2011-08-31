Ext.define('Modules.user.js.form.Login', {
	extend:'Ext.form.Panel',
	height:300,
	url:'/user/process/login',
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initEmailField();
		this.initPasswordField();
		this.initSubmitButton();
	},
	
	initEmailField: function() {
		this.emailField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Email',
			name:'email',
			inputType:'email'
		});
		this.items.push(this.emailField);
	},
	
	initPasswordField: function() {
		this.passwordField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Password',
			name:'password',
			inputType:'password'
		});
		this.items.push(this.passwordField);
	},
	
	initSubmitButton: function() {
		this.buttons = [{
			scope:this,
			text:'Submit',
			handler:this.submit
		}];
	},
	
	submit: function() {
		var form = this.getForm();
		if (form.isValid()) {
			form.submit({
				url:this.url,
				success: function(form, action) {
					console.log('success');
					console.log(arguments);
				},
				
				failure: function(form, action) {
					console.log('failure');
					console.log(arguments);
				}
			})
		}
	}
	
});