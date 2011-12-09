Ext.define('Modules.template.js.view.Interface', {
	extend: 'Redokes.module.Interface',
	
	config: {
		viewCls: 'Modules.template.js.view.OldInterface',
		titleButtons: [{
			text: 'Upload Template',
			viewCls: 'Modules.template.js.form.Template'
		}]
	},
	
	init: function() {
		
	}
	
});