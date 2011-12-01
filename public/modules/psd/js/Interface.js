//Create the namespace
Ext.namespace('Modules.psd', 'Simon.psd');

//Required Files
require([
	'order!/modules/psd/js/Grid.js',
	'order!/modules/psd/js/Form.js',
]);

//Listen for application init
if(window.Simon != null && Simon.Application != null){
	Simon.Application.on('init', function(){
		Simon.Application.registerModule({
			title: 'PSD Importer',
			name: 'psd',
			applicationName: 'Simon.psd.Interface'
		});
	});
}

Simon.psd.Interface = Ext.extend(Ext.TabPanel, {
	initComponent: function(){
		this.items = [];
		this.activeEditors = [];
		this.init();
		Simon.psd.Interface.superclass.initComponent.call(this);
	},
	
	activeEditors: [],
	activeGroupEditors: [],
	
	//Config
	deferredRender: true,
	height: 400,
	activeTab: 0,
    frame: false,
    defaults:{
    	hideMode: 'offsets',
    	autoScroll: true
    },
	
	//Init Functions
	init: function(){
		this.initGrid();
		this.initAddPanel();
	},
	
	
	initGrid: function(){
		this.grid = new Simon.psd.Grid({
			title: 'PSD Templates',
			iconCls: 'grid-icon'
		});
		
		this.grid.on('edit', function(record){
			this.createEditor(record);
		}, this);
		
		this.items.push(this.grid);
	},

	initAddPanel: function(){
		this.addPanel = new Simon.psd.Form({
			title: 'Add PSD Template',
			iconCls: 'add-icon',
			loadRecord: function(){
				return false;
			}
		});

		this.addPanel.on('success', function(panel, response){
			this.addPanel.getForm().reset();
			this.createEditor({data:response.record});
		}, this);

		this.items.push(this.addPanel);
	},

	createEditor: function(record){
		//Check if this has already been created
		if(this.activeEditors[record.data.psdId] != null){
			this.setActiveTab(this.activeEditors[record.data.psdId]);
			return false;
		}

		var editor = new Simon.psd.Form({
			title: record.data.title,
			iconCls: 'edit-icon',
			psdId: record.data.psdId,
			closable: true
		});

		//Add id to active editors
		if(record.data.psdId){
			this.activeEditors[record.data.psdId] = editor;
		}

		editor.on('afterrender', function(){
			editor.loadId(record.data.psdId);
		}, this);

		editor.on('beforedestroy', function(panel){
			this.activeEditors[panel.psdId] = null;
		}, this);

		editor.on('success', function(form, response){
			form.setTitle(response.record.title);
			form.psdId = response.record.psdId;
			this.activeEditors[response.record.psdId] = form;
		}, this);

		this.insert(this.items.length-1, editor);

		this.setActiveTab(editor);
	}
});