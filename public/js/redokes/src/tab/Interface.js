/**
 * <p>Abstract class meant to be extended by a module's interface/view class. Provides
 * methods for a module to easily create and update data in a tabbed environment.
 * </p>
 * @constructor
 * @param {Object} config The config object
 */
Ext.define('Redokes.tab.Interface', {
	extend:'Ext.tab.Panel',
	
//	//Requires
	requires:[
		//Plugins
//		'Ext.ux.TabScrollerMenu',
		'Redokes.panel.plugin.TabContextMenu'
	],
	
	//Config
	deferredRender:true,
	openTabs:{},
	
	/**
	 * @cfg {String} tabTitleTemplate
	 * A string for an Ext.XTemplate used for the
	 * tab title when editing an item. The record of the item being edited is
	 * used for data.
	 */
	tabTitleTemplate: '',
	
	/**
	 * @cfg {String} tabIconCls
	 * A CSS class to be used for the update form tab if.
	 * This gets passed to the tab as an iconCls param
	 */
	tabIconCls: 'contact-icon-16',
	
	/**
	 * @cfg {String} tabClass
	 * The name of the Ext class to be used as the update form
	 */
	tabClass: null,
	
	/**
	 * @cfg {String} tabModel
	 * The name of the Ext.data.Model class that will be used
	 * to populate the update form
	 */
	tabModel: null,
	
	/**
	 * @cfg {String} addFormClass
	 * The name of the Ext class to be used as the create form
	 */
	addFormClass: null,
	
	/**
	 * @cfg {Integer} addFormIndex
	 * <p>The tab position where the add form will be inserted after
	 * a successful creation.</p>
	 */
	addFormIndex: 1,
	
	/**
	 * @cfg {Boolean} showAddTab
	 * <code>true</code> to make the add tab visible <code>false</code> to keep
	 * the add tab hidden
	 */
	showAddTab: true,
	
	constructor: function(){
		this.openTabs = {};
		this.addEvents('add', 'update');
		this.callParent(arguments);
	},
	
	initComponent: function(){
		//Check for required items
		if(this.tabModel == null){
			console.error(this.self.getName() + ' - tabModel is requred');
			return false;
		}
		if(this.tabClass == null){
			console.error(this.self.getName() + ' - tabClass is requred');
			return false;
		}
		
		//Create shortcuts
		this.tabModel = eval(this.tabModel);
		
		//Set up items
		this.items =  this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.plugins = this.plugins || [];
		
		//Init The plugins
//		this.initTabScrollerPlugin();
		this.initTabContextMenuPlugin();
		
		//Init the items
		this.initAddForm();
		
		return this.callParent(arguments);
	},
	
	initTabScrollerPlugin: function(){
		this.tabScrollerPlugin = Ext.create('Ext.ux.TabScrollerMenu', {
			maxText: 15,
			pageSize: 5
		});
		this.plugins.push(this.tabScrollerPlugin);
	},
	
	initTabContextMenuPlugin: function(){
		this.plugins.push(Ext.create('Redokes.panel.plugin.TabContextMenu'));
	},
	
	initAddForm: function(){
		//check if we are showing an add tab
		if(!this.showAddTab){
			return false;
		}
		
		//If the add form exists remove it
		if(this.addForm != null){
			this.remove(this.addForm);
		}
		
		//Create the add form
		this.addForm = Ext.create(this.addFormClass, Ext.apply({
			title: 'Add',
			iconCls: 'add-icon-16'
		}, this.getAddFormConfig()));
		
		//Listeners
		this.addForm.on('success', function(form, response){
			var result = response.result;
			if (result.record) {
				var tab = this.createTab(Ext.create(this.tabModel, result.record));
				tab.show();
				this.fireEvent('add', form, response);
			}
			this.initAddForm();
		}, this);
		
		
		//Insert the add form
		if(!this.rendered){
			this.items.push(this.addForm);
		}
		else{
			this.insert(this.addFormIndex, this.addForm);
		}
	},
	
	createUpdateTab: function(record, config){
		//Create the config
		config[record.idProperty] = record.get(record.idProperty);
		config['record'] = record;
		return Ext.create(this.tabClass, Ext.apply(config, this.getTabConfig(record)));
	},
	
	/**
	 * Creates a new tab for updating the passed record.
	 * Makes a new instance of this.tabClass and adds it to this TMS.tab.Interface instance
	 * @param {Ext.data.Model} record The record that is passed to the update interface
	 * @param {Object} config Additional options to be passed to the update interface
	 * @param {Integer} index (optional) If an index is specified, the new tab will be inserted
	 * at this position. Otherwise it is added as the last tab.
	 * @return {Ext.tab.Panel}
	 */
	createTab: function(record, config, index){
		//Check if this is a record or data we need to turn into a record
		//if(!Ext.ComponentQuery.is(record, ))
		if(config == null){
			config = {};
		}
		
		//Make sure this tab does not already exist
		if (this.openTabs[record.get(record.idProperty)]){
			return this.openTabs[record.get(record.idProperty)];
		}
		
		//Create a container to hold the contact
		var tab = Ext.create('Ext.panel.Panel', {
			closable: true,
			border: false,
			frame: false,
			iconCls: this.tabIconCls,
			title: new Ext.XTemplate(this.tabTitleTemplate).apply(record.data),
			layout:'fit'
		});
		
		//after the container has rendered add the real panel
		tab.on('afterrender', function(panel, options) {
			Ext.defer(panel.setLoading, 1, panel, [true]);
			
			//Create the panel but dont add it
			panel.updateTab = this.createUpdateTab(options.record, options.config);
			panel.updateTab.on('success', function(form, action) {
				this.fireEvent('update', form, action);
			}, this);
			panel.updateTab.on('failure', function(form, action) {
				this.fireEvent('failure', form, action);
			}, this);
			
			Ext.defer(function(){
				//Stop the loading
				panel.setLoading(false);

				//Create and add the panel to the container
				panel.add(panel.updateTab);
			}, 100, this);
				
		}, this, {
			id: record.get(record.idProperty),
			record: record,
			config: config
		});
		
		//Store a reference to this panel
		this.openTabs[record.get(record.idProperty)] = tab;
		
		//Clean up when the tab is closed/destroyed
		tab.on('destroy', function(panel, options) {
			this.openTabs[options.id] = false;
		}, this, {
			id: record.get(record.idProperty)
		});
		
		//Add the panel to the tabs
		if(index == null){
			return this.add(tab);
		}
		else{
			return this.insert(index, tab);
		}
	},
	
	/**
	 * Calls createTab for all passed records and automatically shows the first
	 * tab that is created.
	 * <pre><code>
var selectedRecords = grid.selModel.getSelection();
this.createTabs(selectedRecords);</code></pre>
	 * @param {Ext.data.Model[]} records
	 */
	createTabs: function(records){
		var numRecords = records.length;
		if (numRecords) {
			var tabToShow = false;
			for (var i = 0; i < numRecords; i++) {
				var record = records[i];
				var tab = this.createTab(record);
				if (!tabToShow) {
					tabToShow = tab;
				}
			}
			tabToShow.show();
		}
	},
	
	//Config Getters
	
	/**
	 * Meant to be overwritten to return a custom object. This object is passed
	 * as config to the add panel.
	 * @return {Object}
	 */
	getAddFormConfig: function(){
		return {};
	},
	
	/**
	 * Meant to be overwritten to return a custom object. This object is passed
	 * as config to every update panel.
	 * <pre><code>
return {
	preOrderId: record.get('pre_order_id')
};
</code></pre>
	 * @param {Ext.data.Model} record
	 * @return {Object}
	 */
	getTabConfig: function(record){
		return {};
	},
	
	/**
	 * Returns a model object created from this.tabModel
	 * @return {Ext.data.Model}
	 */
	getModel: function(){
		return this.tabModel;
	},
	
	/**
	 * Returns a reference to the update panel if it exists
	 * @param {Integer} id The primary key of the record being looked up
	 * @return {Ext.tab.Panel/Boolean}
	 */
	getUpdatePanel: function(id){
		if(this.openTabs[id] != null && this.openTabs[id] != false){
			return this.openTabs[id].updateTab;
		}
		else{
			return false;
		}
	}
});