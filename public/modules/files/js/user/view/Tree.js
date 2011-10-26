Ext.define('Modules.files.js.user.view.Tree', {
	extend: 'Ext.tree.Panel',
	
	//Config
	application: null,
	module: null,
	rootVisible:false,
	nodes: [],
	remote: false,
	remoteUserId: 0,

    initComponent: function() {
		this.items = [];
		this.dockedItems = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
		this.initToolbar();
		//this.initSearch();
		this.initDownload();
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.TreeStore');
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			docked: 'top'
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initSearch: function(){
		this.search = new Ext.form.field.Text({
			scope: this,
			emptyText: 'Search...'
		});
		this.toolbar.add(this.search);
	},
	
	initDownload: function(){
		this.downloadButton = new Ext.button.Button({
			scope: this,
			text: 'Download',
			disabled: true,
			handler: function(){
				if(!this.isRemote()){
					this.downloadButton.disable();
					return;
				}
				this.downloadFile();
			}
		});
		this.toolbar.add(this.downloadButton);
		
		this.on('selectionchange', function(selectionModel, records, options){
			//Disable if this is local
			if(!this.isRemote()){
				this.downloadButton.disable();
				return;
			}
			
			//If there are no records disable
			if(!records.length){
				this.downloadButton.disable();
				return;
			}
			
			//If the file is a folder disable
			var record = records[0];
			if(!record.get('leaf')){
				this.downloadButton.disable();
				return;
			}
			
			//Enable
			this.downloadButton.enable();
		}, this);
	},
	
	addFileList: function(fileList){
		var processedList = this.processFileList(fileList);
		this.nodes.push(processedList);
		this.store.tree.root.appendChild(processedList);
	},
	
	processFileList: function(fileList) {
		var numFiles = fileList.length;
		
		if (!numFiles) {
			return [];
		}
		
		// Get the top folder name
		var topDir = fileList[0].webkitRelativePath.split('/')[0];
		
		var processedList = {
			text:topDir,
			leaf:false,
			children:[]
		};
		
		var paths = {};
		paths[topDir] = {
			record:{}
		};
		
		// Loop through files and store the path of every file
		// so we can build an object of the hierarchy
		for (var i = 0, pathParts, fileName; i < numFiles; i++) {
			pathParts = fileList[i].webkitRelativePath.split('/');
			fileName = pathParts.pop();
			for (var j = 0, subPath = paths; j < pathParts.length; j++) {
				var folderName = pathParts[j];
				if (subPath[folderName] == null) {
					subPath[folderName] = {
						record:fileList[i],
						isFile:false
					};
				}
				subPath = subPath[folderName];
			}
			if(fileName != "."){
				subPath[fileName] = {
					record:fileList[i],
					isFile:true
				};
			}
		}
		this.buildNodes(paths[topDir], processedList.children);
		return processedList;
	},
	
	buildNodes: function(dir, children) {
		for (var i in dir) {
			var item = dir[i];
			var config = {};
			if (i != 'record') {
				config = {
					text: i
				};
				if (dir[i].isFile) {
					//Add Config
					Ext.apply(config, {
						leaf:true,
						id: dir[i].record.webkitRelativePath,
						file: dir[i].record
					});
					
					//Check File type
					if(item.record.type.match(/^audio/gi)){
						Ext.apply(config, {
							iconCls: 'audio-icon-16'
						});
					}
					children.push(config);
				}
				else {
					children.push(Ext.apply({
						text:i,
						leaf:false,
						children:[]
					}, dir[i].record));
					this.buildNodes(dir[i], children[children.length-1].children);
				}
			}
		}
		return children;
	},
	
	convertToObject: function(){
		//Build the nodes
		var nodes = [];
		this.getRootNode().eachChild(function(node){
			nodes.push(this.convertNode(node));
		}, this);
		return nodes;
	},
	
	convertNode: function(node){
		var objectNode = {};
		Ext.apply(objectNode, node.data);
		objectNode.children = [];
		Ext.each(node.childNodes, function(node){
			objectNode.children.push(this.convertNode(node));
		}, this);
		
		return objectNode;
	},
	
	loadUser: function(){
		this.store.getRootNode().removeAll();
		Ext.each(this.nodes, function(node){
			this.store.tree.root.appendChild(node);
		}, this);
		this.remote = false;
	},
	
	loadRemoteUser: function(id, nodes){
		this.store.getRootNode().removeAll();
		Ext.each(nodes, function(node){
			this.store.tree.root.appendChild(node);
		}, this);
		this.remote = true;
		this.remoteUserId = id;
	},
	
	isRemote: function(){
		return this.remote;
	},
	
	downloadFile: function(){
		//Ensure we can download the file
		var records = this.getSelectionModel().getSelection();
		if(!records.length){
			return;
		}
		var record = records[0];
		if(!record.get('leaf')){
			return;
		}
		
		//Download the file from the remote user
		console.log(record.getId());
		this.application.getSocketClient().send(
			'file',
			'get',
			{ 
				socketId:  this.remoteUserId,
				nodeId: record.internalId
			}
		);
	}
});