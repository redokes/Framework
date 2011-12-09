Ext.define('Modules.template.js.Template', {
	extend: 'Redokes.module.Module',
	
	config: {
		name: 'template',
		title: 'Templates',
		viewClass: 'Modules.template.js.view.Interface',
		css: '/modules/template/css/template.css',
		
		icon: {
			small: '/modules/template/resources/img/template-16.png',
			medium: '/modules/template/resources/img/template-32.png',
			large: '/modules/template/resources/img/template-128.png'
		}
	}
	
});