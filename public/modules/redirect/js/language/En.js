Ext.namespace('Simon.redirect.language');
Simon.redirect.language.En = {
	
	title: 'Redirects',
	
	//=========================================================
	//	Models associated with this module
	//=========================================================
	models: {
		redirect:{
			fields: {
				requestString: {
					title: 'Request String'
				},
				redirectUrl: {
					title: 'Redirect URL'
				}
			}
		}
	},
	
	//=========================================================
	//	Form
	//=========================================================
	form:{
		title: 'Options',
		fields:{
			requestString: {
				info: 'Enter the text you want to use to trigger the redirect. For example, if ' +
					'you want to redirect yourdomain.com/google to Google\'s homepage, ' +
					'you would enter "google".'
			},
			redirectUrl: {
				info: 'The page you want users to end up if they type in the term above. If ' +
	 				'redirecting to a different domain, be sure to include http:// ' +
					'Example: http://domain.com ' +
					'If you are redirecting to a page on this site, it is preferred to ' +
					'enter the URL as /pages/page-name'
			}
		}
	},
	
	//=========================================================
	//	Grid
	//=========================================================
	grid: {
		buttons:{
			flag: 'Flag',
			unflag: 'Unflag',
			'public': 'Public',
			'private': 'Private',
			publish: 'Publish',
			unpublish: 'Unpublish',
			'delete': 'Delete'
		},
		confirm: 'Are you sure you want to delete the selected items?'
	}
}