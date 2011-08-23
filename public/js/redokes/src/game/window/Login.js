Ext.define('Redokes.game.window.Login', {
	extend:'Ext.window.Window',
	
	title:'Login',
	closeAction:'hide',
	modal:true,
	bodyPadding:8,
	game:false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.initFields();
		this.initListeners();
		this.callParent(arguments);
	},
	
	initFields: function() {
		this.loginField = Ext.create('Ext.form.field.Text', {
			name:'name',
			fieldLabel:'Character Name',
			enableKeyEvents:true
		});
		this.items.push(this.loginField);
		
		this.bbar = [{
			text:'Login',
			scope:this,
			handler: function() {
				this.login();
			}
		}];
	
	},
	
	initListeners: function() {
		this.loginField.on('keypress', function(field, e) {
			if (e.keyCode == e.ENTER) {
				e.preventDefault();
				this.login();
			}
		}, this);
		
		this.on('show', function() {
			this.loginField.setValue('');
			this.loginField.focus();
		}, this);
	},
	
	login: function() {
		var name = this.loginField.getValue();
		this.game.player.load(name);
		this.hide();
	}
	
});