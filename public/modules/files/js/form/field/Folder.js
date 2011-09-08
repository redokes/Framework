Ext.define('Modules.files.js.form.field.Folder', {
	extend: 'Ext.form.field.File',
	
	buttonOnly: true,
	lastEvent: null,

    createFileInput : function() {
        var me = this;
        me.fileInputEl = me.button.el.createChild({
            name: me.getName(),
            cls: Ext.baseCSSPrefix + 'form-file-input',
            tag: 'input',
            type: 'file',
			webkitdirectory: true,
            size: 1
        }).on('change', me.onFileChange, me);
		
		me.fileInputEl.on('change', function(e) {
			this.lastEvent = e;
			this.fireEvent('select', this, this.fileInputEl, e);
			var files = this.getFiles();
			var file = files[0];
			var userFile = Ext.create('Modules.files.js.user.File', file);
			userFile.download();
		}, this);
    },
	
	getDirectory: function(){
		var directory = false;
		if(this.lastEvent != null){
			var files = this.getFiles();
			directory = files[0].webkitRelativePath.split('/')[0];
		}
		return directory;
	},
	
	getFiles: function(){
		var files = [];
		if(this.lastEvent != null){
			files = this.lastEvent.target.files;
		}
		return files;
	}
});

