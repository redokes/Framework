Ext.define('Modules.user.js.form.LoginRegister', {
	extend:'Ext.panel.Panel',
	layout:'hbox',
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initLoginForm();
		this.initRegisterForm();
	},
	
	initLoginForm: function() {
		this.loginForm = Ext.create('Modules.user.js.form.Login', {
			title:'Login',
			flex:1
		});
		this.items.push(this.loginForm);
	},
	
	initRegisterForm: function() {
		this.registerForm = Ext.create('Modules.user.js.form.Register', {
			title:'Register',
			flex:1
		});
		this.items.push(this.registerForm);
	}
});