Ext.namespace('Simon.psd');
Simon.psd.Form = Ext.extend(Ext.ux.papercut.Form, {
	processingPage: '/psd/private/',
	fileUpload: true,
	loadRowAction:'load-row',
	
	initFormItems: function() {
		this.initTitle();
		this.initFile();
		this.initHidden();
	},
	
	initTitle: function(){
    	this.items.push({
    		fieldLabel: 'Title',
    		name:'title'
    	});
    },
    
    initFile: function(){
    	this.items.push({
    		xtype: 'fileuploadfield',
        	fieldLabel: 'File',
        	buttonText: 'Choose File',
        	name: 'file'
    	});
    },
    
    initHidden: function(){
    	this.items.push({
    		xtype: 'hidden',
        	name: 'psdId',
        	value: 0
    	});
    }
});