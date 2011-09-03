Ext.namespace('Modules.redirect', 'Simon.redirect');

Simon.language.Load('redirect', function(){

	//Load all the required files
	require([
		'order!/modules/redirect/js/Grid.js',
		'order!/modules/redirect/js/Form.js'
	]);

	//Listen for application init
	Simon.Application.onLoad(function(){
		Simon.Application.registerModule({
			title: 'Redirect',
			name: 'redirect',
			icon: '/modules/navigation/images/icon.png',
			applicationName: 'Simon.redirect.Interface'
		});
	});
});

Simon.redirect.Interface = Ext.extend(Simon.ui.layout.Interface, {
	init: function(){
		this.initGrid();
		this.initForm();
		this.initEditForm();
		this.initSections();
	},

	initGrid: function(){
		this.grid = new Simon.redirect.Grid({
			title: 'Redirects',
			iconCls: 'grid-icon',
			editPage: ''
		});

		this.grid.on('edit', function(record){
			this.setActiveItem(this.editForm, {
				title: record.data.title
			});
			this.editForm.load(record.data.redirectId);
		}, this);

		//Register the grid
		this.register(this.grid, {
			title: 'Redirects'
		});

	},

	initForm: function(){
		this.form = new Simon.redirect.Form();

		this.form.on('show', function(){
			this.form.reset();
		}, this);

		this.register(this.form, {
			title: 'Add Redirect'
		});
	},

	initEditForm: function(){
		this.editForm = new Simon.redirect.Form();

		this.register(this.editForm, {
			title: 'Edit Page'
		});
	},

	initSections: function() {
		this.addHomeSection({
			items:[{
				scope: this,
				text: 'Manage Redirects',
				handler: function(button){
					this.setActiveItem(this.grid);
				}
			},{
				scope: this,
				text: 'Add Redirect',
				handler: function(button){
					this.setActiveItem(this.form);
				}
			}]
		});
	}
	
});