Ext.define('Redokes.module.Test', {
	extend: 'Redokes.module.Module',
	
	config: {
		name: 'test',
		title: 'Test Module',
		menu: [{
			parent: false,
			display: 'Test Top Level',
			icon: {
				small: '/modules/template/resources/img/template-16.png',
				medium: '/modules/template/resources/img/template-32.png',
				large: '/modules/template/resources/img/template-128.png'
			},
			params: {
				one: 'two'
			},
			items: [{
				display: 'Test Sub Level',
				icon: {
					small: '/modules/template/resources/img/template-16.png',
					medium: '/modules/template/resources/img/template-32.png',
					large: '/modules/template/resources/img/template-128.png'
				},
				params: {
					sub: true,
					wes: 'testing'
				}
			}]
		},{
			parent: false,
			display: 'Test 2 Top',
			icon: {
				small: '/modules/template/resources/img/template-16.png',
				medium: '/modules/template/resources/img/template-32.png',
				large: '/modules/template/resources/img/template-128.png'
			},
			params: {
				three: 'four',
				five: 'six'
			}
		}]
	}
});