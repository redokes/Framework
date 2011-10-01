Ext.define('Modules.files.js.user.view.Tree', {
	extend: 'Ext.tree.Panel',
	
	//Config
	rootVisible:false,

    initComponent: function() {
		this.items = [];
		this.dockedItems = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
		this.initToolbar();
		this.initSearch();
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
	
	addFileList: function(fileList){
		var processedList = this.processFileList(fileList);
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
	}
});