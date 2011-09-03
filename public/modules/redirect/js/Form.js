Ext.namespace('Simon.redirect');
Simon.redirect.Form = Ext.extend(Ext.ux.papercut.Form, {
	//Config
	processingPage: '/redirect/private/',
	showFailureMessage:false,
	processAction:'process',
	loadRowAction:'load-row',
	
	  //Init Functions
    initFormItems: function(){
    	this.initListeners();
    	this.initRequestString();
    	this.initRedirectUrl();
    	this.initHidden();
    },
    
    initListeners: function(){
    	this.on('submitsuccess', function(form, action, response){
			this.loadRecord(response.record);
		}, this);
    },

	loadRecord: function(record){
		this.record = record;
		this.fireEvent('load', this, this.record);
	},
    
    initRequestString: function(){
	 	this.items.push({
			xtype:'fieldinfo',
			title:Simon.redirect.Language.models.redirect.fields.requestString.title,
			html:Simon.redirect.Language.form.fields.requestString.info
		});

		this.items.push({
    		fieldLabel:Simon.redirect.Language.models.redirect.fields.requestString.title,
    		name:'requestString'
    	});
    },
    
    initRedirectUrl: function() {
    	this.items.push({
			xtype:'fieldinfo',
			title:Simon.redirect.Language.models.redirect.fields.redirectUrl.title,
			html:Simon.redirect.Language.form.fields.redirectUrl.info
		});
		
		this.items.push({
    		fieldLabel:Simon.redirect.Language.models.redirect.fields.redirectUrl.title,
    		name:'redirectUrl'
    	});
    },
    
    initHidden: function(){
    	this.items.push({
    		xtype: 'hidden',
    		name: 'redirectId',
    		value: 0
    	});
    },

	reset: function(){
		this.getForm().reset();
	}
});