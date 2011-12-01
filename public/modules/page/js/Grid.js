/**
 *
 */
Ext.define('TMS.contacts.view.Grid', {
	extend: 'TMS.grid.Grid',
	
	//Requires
	requires:[
		'TMS.contacts.model.Contact'
	],
	
	//Config
	processingPage: '/at-ajax/modules/contact/process/get',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.addEvents('editrecord');
		
		this.initSelectionModel();
		this.initColumns();
		this.initStore();
		
		this.initActionBar();
		this.initPager();
		
		this.initListeners();
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true,
			dock:'top'
		});
		this.dockedItems.push(this.pager);
	},
	
	initActionBar: function() {
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[{
				scope:this,
				text:'Edit',
				icon:'/resources/icons/edit-24.png',
				scale:'medium',
				handler: function() {
					this.fireEvent('editrecord', this);
				}
			}]
		});
		this.dockedItems.push(this.topBar);
	},
	
	initSelectionModel: function() {
		this.selModel = Ext.create('Ext.selection.CheckboxModel', {
			mode: 'SIMPLE'
		});
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.store.on('beforeload', function(){
			console.log('before load');
			console.log(this.getExtraParams);
			this.store.proxy.extraParams = this.getExtraParams();
		}, this);
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'contact_name',
			flex: 1,
			renderer: function(value, options, record){
				return value;
				return Ext.String.format(
					'<a href="/contacts/?d=contacts&a=view&id={0}">{1}</a>',
					record.get('contact_id'),
					value
				);
			}
		},{
			header: 'Company',
			dataIndex: 'customer_name',
			flex: 1
			//xtype:'templatecolumn',
			//tpl:'<a href="/customers/?d=customers&a=view&id={customer_id}">{customer_name}</a>'
		},{
			header: 'Status',
			dataIndex: 'status',
			flex: 1
		},{
			header: 'Next Action',
			dataIndex: 'next_action_date',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<tpl if="upToDate">' +
					'<span style="color:green;">{next_action_date_display}</span>' +
				'</tpl>' +
				'<tpl if="!upToDate">' +
					'<span style="color:red;">{next_action_date_display}</span>' +
				'</tpl>'
		},{
			header: 'Owner',
			dataIndex: 'owner_name',
			flex: 1
		}];
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.Store', {
			model: 'TMS.contacts.model.Contact',
			remoteSort: true,
			pageSize: 20
		});
	},
	
	getExtraParams: function() {
		return this.extraParams;
	}
});