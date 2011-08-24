Ext.define('Modules.navigation.js.NavigationManager', {
	extend:'Ext.panel.Panel',
	
	processingPage:'/navigation/private/',
	autoScroll: false,
	layout:'border',
	height:400,
	frame:false,
	border: false,
	cls: 'image-dataview',
	defaults:{
		border: false,
		frame: false
	},
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initToolbar();
		this.initTree();
//		this.initTreeEditor();
		this.initEastPanel();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.tbar = new Ext.toolbar.Toolbar({
			items:[{
				text:'Add Track',
				handler: this.addTrack,
				scope:this,
				icon: '/js/ext/resources/icons/add.gif'
			},{
				text:'Add Item',
				handler: this.addItem,
				scope:this,
				icon: '/js/ext/resources/icons/add.gif'
			},{
				text:'Refresh',
				handler: this.refreshNode,
				scope:this
			},'|',{
				text:'Paste List',
				handler: this.showPasteList,
				scope:this,
				icon: '/js/ext/resources/icons/paste.png'
			},'|',{
				text:'Delete',
				handler: this.deleteItem,
				scope:this,
				icon: '/js/ext/resources/icons/delete.gif'
			}]
		});
	},
	
	initTree: function() {
		this.tree = new Ext.tree.TreePanel({
			useArrows: true,
			autoScroll: true,
			animate: true,
			enableDD: true,
			containerScroll: true,
			border: false,
			region:'center',
			height:400,
			
			// auto create TreeLoader
			dataUrl: this.processingPage + 'get-nodes',
			
			root: {
				nodeType: 'async',
				text: 'Navigation Tracks',
				draggable: false,
				id: 'rootNode'
			},
			rootVisible:false
		});
//		this.selModel = this.tree.getSelectionModel();
		
		this.on('afterrender', function(){
			this.tree.getRootNode().expand();
		}, this);
		
		//Add to panel
		this.items.push(this.tree);
	},
	
	initTreeEditor: function() {
		this.treeEditor = new Ext.tree.TreeEditor(this.tree);
		this.treeEditor.on('beforestartedit', this.treeEditBeforeStart, this);
		this.treeEditor.on('complete', this.treeEditComplete, this);
	},
	
	initEastPanel: function() {
		this.pageStore = new Ext.data.JsonStore({
	        url: this.processingPage + 'pages',
			root: 'records',
	        totalProperty: 'total',
	        fields: [
	            'title',
	        	'url'
	        ]
	    });
	    
	    // Custom rendering Template
	    var resultTpl = new Ext.XTemplate(
	        '<tpl for="."><div class="search-item" style="padding:5px">',
	            '{title}',
	        '</div></tpl>'
	    );
		
		this.pageCombo = new Ext.form.ComboBox({
	        store: this.pageStore,
	        fieldLabel: 'URL',
	        hiddenName: 'url',
	        name: 'url',
	        displayField:'url',
	        valueField: 'url',
	        typeAhead: false,
	        loadingText: 'Searching...',
	        width: 200,
	        pageSize:10,
	        hideTrigger:false,
	        triggerAction: 'all',
	        minChars: 1,
	        tpl: resultTpl,
	        itemSelector: 'div.search-item'
	    });
		
		this.itemFormPanel = new Ext.FormPanel({
			labelWidth: 50, // label settings here cascade unless overridden
			url: this.processingPage + 'update-item',
			bodyStyle:'padding:5px 5px 0',
			defaults: {width: 200},
			defaultType: 'textfield',
			frame: true,
	
			items: [{
					fieldLabel: 'Display',
					name: 'title',
					allowBlank:false
				},
				this.pageCombo,
				{
					fieldLabel: 'Target',
					hiddenName:'target',
					store: new Ext.data.SimpleStore({
						fields:['target', 'displayText'],
						data:[[0, 'Same Window'],[1, 'New Window']]
					}),
					mode:'local',
					editable:false,
					xtype:'combo',
					lazyRender:true,
					valueField:'target',
					displayField:'displayText',
					triggerAction:'all'
				},{
					name: 'itemId',
					xtype: 'hidden'
				}
			],
	
			buttons: [{
				text: 'Save',
				handler: this.updateItem,
				scope:this
			},{
				text: 'Cancel',
				handler: this.cancelUpdate,
				scope:this
			}]
		});
		
		this.trackFormPanel = new Ext.FormPanel({
			labelWidth: 50, // label settings here cascade unless overridden
			url: this.processingPage + 'update-track',
			bodyStyle:'padding:5px 5px 0',
			defaults: {width: 200},
			defaultType: 'textfield',
			frame: true,
	
			items: [{
					fieldLabel: 'Title',
					name: 'title',
					allowBlank:false
				},{
					name: 'trackId',
					xtype: 'hidden'
				}
			],
	
			buttons: [{
				text: 'Save',
				handler: this.updateItem,
				scope:this
			},{
				text: 'Cancel',
				handler: this.cancelUpdate,
				scope:this
			}]
		});
		
		this.eastPanel = new Ext.Panel({
			title:'Edit Item',
			layout:'card',
			region:'east',
			width: 300,
			disabled:true,
			items:[this.itemFormPanel, this.trackFormPanel],
			activeItem:0
		});
		
		
		this.items.push(this.eastPanel);
	},
	
	initListeners: function() {
		return;
		this.selModel.on('selectionchange', this.selectionChange, this);
		this.tree.getLoader().on('load', this.loadedNode, this, 500);
		this.tree.on('beforemovenode', this.beforeMoveNode, this);
		this.tree.on('movenode', this.moveNode, this);
	},
	
	selectionChange: function(sm, nodes) {
		// node will be null if it was just deleted or moved, so check that first
		if (nodes != null) {
			if (nodes.length == 1) {
				this.eastPanel.enable();
				var node = nodes[0];
				if (node.attributes.itemType == 'item') {
					this.eastPanel.getLayout().setActiveItem(0);
					this.eastPanel.setTitle(node.attributes.title);
					this.itemFormPanel.getForm().setValues([{
						id:'title',
						value:node.attributes.title
					},{
						id:'url',
						value:node.attributes.url
					},{
						id:'itemId',
						value:node.attributes.itemId
					}]);
					var targetField = this.itemFormPanel.getForm().findField('target');
					targetField.setValue(node.attributes.target);
				}
				else if (node.attributes.itemType == 'track') {
					this.eastPanel.getLayout().setActiveItem(1);
					this.eastPanel.setTitle(node.attributes.title);
					this.trackFormPanel.getForm().setValues([{
						id:'title',
						value:node.attributes.title
					},{
						id:'trackId',
						value:node.attributes.trackId
					}]);
				}
			}
			else {
				this.eastPanel.disable();
			}
		}
	},
	
	loadedNode: function(loader, node) {
		if (!node.isExpanded()) {
			node.expand();
		}
	},

	refreshNode: function(node) {
		var nodes = this.selModel.getSelectedNodes();
		if (nodes.length) {
			var node = nodes[0];
			if (node.isExpanded()) {
				this.tree.getLoader().load(node);
			}
			else {
				node.expand();
			}
			
		}
	},
	
	beforeMoveNode: function(tree, node, oldParentNode, newParentNode, index) {
		// return false to cancel move
		
		// don't let a node be dragged to the root
		if (newParentNode == this.tree.getRootNode()) {
			return false;
		}
	},
	
	moveNode: function(tree, node, oldParentNode, newParentNode, index) {
		var childNodes = newParentNode.childNodes;
		var newOrder = [];
		for (var i = 0; i < childNodes.length; i++) {
			if (childNodes[i].attributes.itemId) {
				newOrder.push(childNodes[i].attributes.itemId);
			}
		}
		var params = {
			'newOrder[]':newOrder,
			itemId:node.attributes.itemId,
			trackId:newParentNode.attributes.trackId,
			parentId:newParentNode.attributes.itemId,
			sortOrder:index,
			oldParentId:oldParentNode.attributes.trackId
		};
		Ext.Ajax.request({
			scope: this,
			url: this.processingPage + 'update-item',
			method:'post',
			params: params,
			success: function(r){
				var response = Ext.decode(r.responseText);
				if (response.row.parentId > 0) {
					var node = this.tree.getNodeById('itemId-' + response.row.parentId);
					this.tree.getLoader().load(node);
				}
				else {
					var node = this.tree.getNodeById('trackId-' + response.row.trackId);
					this.tree.getLoader().load(node);
				}
			}
		});
	},
	
	treeEditBeforeStart: function(editor) {
		return true;
		
		// return false to cancel edit
		var node = editor.editNode;
		if (node.id.substr(0, 7) == 'trackId') {
			return true;
		}
		return false;
	},
	
	treeEditComplete: function(editor, newValue, oldValue) {
		if (newValue != oldValue) {
			var node = editor.editNode;
			
			Ext.Ajax.request({
				scope: this,
				url: this.processingPage + 'update',
				method:'post',
				params: {
					trackId:node.attributes.trackId,
					title:newValue,
					itemType:node.attributes.itemType,
					itemId:node.attributes.itemId
				},
				success: function(r){
					var response = Ext.decode(r.responseText);
					if (response.good) {
						// need to update the title in the east panel
						this.eastPanel.setTitle(response.row.title);

						// update the east panel forms
						if (response.row.itemId) {
							// track item form
							this.itemFormPanel.getForm().setValues({
								title:response.row.title
							});
						}
						else {
							// track form
							this.trackFormPanel.getForm().setValues({
								title:response.row.title
							});
						}
					}
				}
			});
		}
	},
	
	addTrack: function() {
		Ext.Ajax.request({
			scope: this,
			url: this.processingPage + 'add-track',
			method:'post',
			params: {
				
			},
			success: function(r){
				var response = Ext.decode(r.responseText);
				this.tree.getLoader().load(this.tree.getRootNode());
			}
		});
	},
	
	addItem: function() {
		// only select the first selected node
		var nodes = this.selModel.getSelectedNodes();
		if (nodes.length) {
			var node = nodes[0];
			this.selModel.select(node);
			Ext.Ajax.request({
				scope: this,
				url: this.processingPage + 'add-item',
				method:'post',
				params: {
					trackId:node.attributes.trackId,
					parentId:node.attributes.itemId,
					title: node.attributes.title
				},
				success: function(r){
					var response = Ext.decode(r.responseText);
					if (response.itemId) {
						// get parent node
						var node = this.tree.getNodeById('itemId-' + response.itemId);
						this.tree.getLoader().load(node);
					}
					else {
						// get parent node
						var node = this.tree.getNodeById('trackId-' + response.trackId);
						this.tree.getLoader().load(node);
					}
					new Ext.ux.Notify({
			 			title: 'Success',
			 			msg: response.messages
			 		}).show(document);
				}
			});
		}
	},
	
	showPasteList: function() {
		var nodes = this.selModel.getSelectedNodes();
		if (nodes.length) {
			var node = nodes[0];
			this.selModel.select(node);
			if (this.pasteWindow == null) {
				this.pasteWindow = new Ext.Window({
					title:'Paste List',
					width:300,
					height:200,
					buttons: [{
						text: 'Save',
						handler: this.pasteList,
						scope:this
					},{
						text: 'Cancel',
						handler: function() {
							Ext.get('pasteListText').value = '';
							this.pasteWindow.hide();
						},
						scope:this
					}],
					items:[{
						html:'<textarea name="pasteListText" id="pasteListText" style="width:280px; height:130px;"></textarea>'
					}]
				});
			}
			this.pasteWindow.show();
		}
	},
	
	updateItem: function() {
		this.eastPanel.getLayout().activeItem.getForm().submit({
			scope:this,
			success: function(form, action) {
				var response = action.result;
				var node;
				if (response.row.itemId) {
					node = this.tree.getNodeById('itemId-' + response.row.itemId);
				}
				else {
					node = this.tree.getNodeById('trackId-' + response.row.trackId);
				}
				
				node.setText(response.row.title);
				Ext.apply(node.attributes, response.row);
			},
			failure: function(form, action) {
				var response = action.result;
			}
		});
	},

	cancelUpdate: function() {
		this.eastPanel.disable();
	},

	pasteList: function() {
		var nodes = this.selModel.getSelectedNodes();
		if (nodes.length) {
			var node = nodes[0];
			this.selModel.select(node);
			Ext.Ajax.request({
				scope: this,
				url: this.processingPage + 'paste-list',
				method:'post',
				params: {
					html:Ext.get('pasteListText').dom.value,
					trackId:node.attributes.trackId,
					parentId:node.attributes.itemId
				},
				success: function(r){
					var response = Ext.decode(r.responseText);
					console.log(response.messages);
					this.refreshNode(node);
				}
			});
		}
	},
	
	deleteItem: function() {
		Ext.Msg.show({
    	   scope: this,
		   title:'Confirm Delete',
		   msg: 'Are you sure you want to delete the selected items?',
		   buttons: Ext.Msg.YESNOCANCEL,
		   fn: function(id){
		   		if(id == "yes"){
		   			this.eastPanel.disable();
					var nodes = this.selModel.getSelectedNodes();
					if (nodes.length) {
						var items = [];

						// build item array of nodes to send to server
						for (var i = 0; i < nodes.length; i++) {
							var node = nodes[i];
							items.push({
								trackId:node.attributes.trackId,
								itemId:node.attributes.itemId
							});
						}

						// remove node from tree if it hasn't already been removed
						for (var i = 0; i < nodes.length; i++) {
							// check that the node is still in the tree
							if (this.tree.getRootNode().contains(nodes[i])) {
								nodes[i].remove();
							}
						}
						
						Ext.Ajax.request({
							scope: this,
							url: this.processingPage + 'delete-item',
							method:'post',
							params: {
								items:Ext.encode(items)
							},
							success: function(r){
								var response = Ext.decode(r.responseText);
								
							}
						});
					}
		   		}
		   }
		});
	}
});