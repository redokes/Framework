/**
 *
 */
Ext.define('Redokes.form.plugin.StatusBar', {
	extend: 'Ext.util.Observable',
	
	//Config
	panel: null,
	isForm: false,
	dockTo: null,
	redirect: true,
	redirectTimeout: 2000,
	
	constructor: function(){
		this.callParent(arguments);
		this.addEvents('showerror');
	},
	
	// private
    init: function(panel) {
		
		//Save the form
		this.panel = panel;

		//Make sure this is a redokes form
		if(Ext.ComponentQuery.is(panel, 'redokesform')){
			//Mark this as a form
			this.isForm = true;
			
			//Init the listeners
			this.initListeners();
		}
		
		//Init the statusbar
		this.initStatusBar();
    },
	
	initListeners: function(){
		//before submit listener
		this.panel.on('beforesubmit', this.onBeforeSubmit, this);
		
		//Submit listener
		this.panel.on('submit', this.onSubmit, this);
		
		//Cancel listener
		this.panel.on('cancelsubmit', this.onCancelSubmit, this);
		
		//Failure Listener
		this.panel.on('failure', function(form, response){
			this.onFailure(response.result);
		}, this);
		
		//Success Listener
		this.panel.on('success', function(form, response){
			this.onSuccess(response.result);
		}, this);
	},
	
	initStatusBar: function(){
		this.statusBar = Ext.create('Ext.ux.statusbar.StatusBar', {
			scope: this,
			docked: 'bottom',
			dock: 'bottom',
			items: this.items || []
		});
		
		this.statusBar.on('afterrender', function(){
			this.statusTip = Ext.create('Ext.tip.ToolTip', {
				scope: this,
				target: this.statusBar.getEl(),
				anchor: 'bottom',
				autoHide: false,
				hasContent: false,
				maxWidth: 200,
				listeners: {
					'beforeshow': Ext.bind(function(){
						if(!this.statusTip.hasContent){
							return false;
						}
					}, this)
				}
			});
			
			this.panel.on('destroy', function(){
				this.statusTip.destroy();
			}, this);
			
			this.panel.on('hide', function(){
				this.statusTip.hide();
			}, this);
			
			//Only do this if we are in a form
			if(this.isForm){
				this.statusTip.on('afterrender', function(){
					this.statusTip.getEl().on('click', function(event, el){
						var element = event.getTarget('li');
						if(element == null){
							return;
						}
						var field = Ext.get(element).getAttribute('field');
						var formField = this.panel.getForm().findField(field);
						this.fireEvent('showerror', field);
						this.statusTip.hide();
					}, this);
				}, this);
			}

		}, this);
		
		if(this.dockTo){
			this.dockTo.addDocked(this.statusBar);
		}
		else{
			this.panel.addDocked(this.statusBar);
		}
	},
	
	setStatus: function(config){
		this.statusBar.clearStatus();
		this.statusBar.setStatus(config);
		
		//Check if there is a config tooltip
		if(config.tooltip != null && config.tooltip.length){
			//Update the message of the tip
			this.statusTip.update(config.tooltip);
			this.statusTip.hasContent = true;
			this.statusTip.show();
		}
		else{
			this.statusTip.hasContent = false;
			this.statusTip.update('');
		}
	},
	
	setResponse: function(response){
		if(response.success){
			this.onSuccess(response);
		}
		else{
			this.onFailure(response);
		}
	},
	
	onBeforeSubmit: function() {
		this.setStatus({
			text: ''
		});
		this.statusBar.showBusy('Saving...');
	},
	
	onSubmit: function() {
		//Was this form invalid
		if(this.isForm){
			if(!this.panel.getForm().isValid()){
				this.showInvalidMessage();
			}
		}
	},
	
	onCancelSubmit: function(){
		if(!this.panel.getForm().isValid()){
			this.showInvalidMessage();
		}
		else{
			this.setStatus({
				text: ''
			});
		}
	},
	
	onSuccess: function(response) {
		this.setStatus({
			text: 'Success!',
			iconCls: 'check-icon-16',
			tooltip: response.msgStr
		});

		//Redirect
		if(this.redirect && response.redirect.length){
			setTimeout(Ext.bind(function(){
				location.href = response.redirect;
			}, this), this.redirectTimeout);
		}
		else{
			setTimeout(Ext.bind(function(){
				try{
					this.statusBar.clearStatus();
					this.statusTip.hide();
					this.statusTip.update('');
				}
				catch(e){}
			}, this), 4000);
		}
	},
	
	onFailure: function(response) {
		this.setStatus({
			text: 'Error',
			iconCls: 'warning-icon-16',
			tooltip: response.errorStr
		});
	},
	
	showInvalidMessage: function(){
		//Build the error string
		var errorStr = '<div class="form-errors"><ul>';
		this.panel.getForm().getFields().each(function(field){
			var msg = field.getErrors()[0];
			var name = field.name;
			if (field.fieldLabel) {
				name = field.fieldLabel;
			}
			if (msg) {
				errorStr += '<li field="' + field.name + '">' + name + ' - ' + msg + '</li>';
			}
		}, this);
		errorStr += '</div>';

		this.setStatus({
			text: 'Error.',
			iconCls: 'warning-icon-16',
			tooltip: errorStr
		});
	}
});