Ext.define('Modules.psd.js.Psd', {
	extend: 'Redokes.module.Module',
	
	config: {
		name: 'psd',
		title: 'Psd',
		viewClass: 'Modules.psd.js.Interface',
		css: '/modules/template/css/template.css',
		
		icon: {
			small: '/modules/psd/resources/img/psd-16.png',
			medium: '/modules/psd/resources/img/psd-32.png',
			large: '/modules/psd/resources/img/psd-128.png'
		}
	}
	
});