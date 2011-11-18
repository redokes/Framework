/**
 * 
 */
Ext.define('Modules.template.js.view.Preview', {
	extend:'Redokes.panel.Iframe',
	
	mercuryWindow: false,
	mercury: false,
	mercuryInstance: false,
	templateWindow: false,
	templateIframe: false,
	
	record: false,
	selectedId: false,
	
	processingPage: '/template/template/',
	
	init: function() {
		this.callParent(arguments);
		this.initToolbar();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.makeEditableButton = Ext.create('Ext.button.Button', {
			scope: this,
			text:'Make Editable',
			handler: this.makeEditable
		});
		
		this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock: 'top',
			items:[
				this.makeEditableButton
			]
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initListeners: function() {
		this.on('load', function() {
			this.mercuryWindow = this.iframe.dom.contentWindow;
			this.mercury = this.mercuryWindow.Mercury;
			this.mercuryInstance = this.mercuryWindow.mercuryInstance;
			this.mercuryInstance.saveUrl = this.processingPage + 'update-content';
			
			setTimeout(Ext.bind(this.registerTemplateIframe, this), 100);
		}, this);
	},
	
	registerTemplateIframe: function() {
		this.templateIframe = Ext.get(this.mercuryWindow.document.getElementsByTagName('iframe')[0]);
		this.templateWindow = this.mercuryWindow.document.getElementsByTagName('iframe')[0].contentWindow;
		this.templateIframe.on('load', function() {
			this.initRealListeners();
		}, this);
	},
	
	getIframeEl: function(id) {
		return Ext.get(this.templateWindow.document.getElementById(id));
	},
	
	getIframeBody: function() {
		return Ext.get(this.templateWindow.document.body);
	},
	
	initRealListeners: function() {
		Ext.get(this.templateWindow.document.body).on('click', this.itemClick, this);
		window.wes = this.templateWindow;
		console.log(this.templateWindow.Mercury);
		console.log(this.templateWindow.document.Mercury);
	},
	
	itemClick: function(e, el) {
		e.preventDefault();
		if (!el.id) {
			// Loop up to body until we find an id
			var body = this.getIframeBody();
			while (el != null && !el.id) {
				el = el.parentNode;
			}
		}
		if (el.id) {
			if (!Ext.get(el).hasCls('mercury-region')) {
				this.selectedId = el.id;
				this.makeEditableButton.setText('Make Editable - ' + this.selectedId);
				this.getIframeEl(el.id).highlight();
			}
		}
	},
	
	makeEditable: function() {
		Ext.Ajax.request({
			scope: this,
			method: 'post',
			url: this.processingPage + 'make-editable',
			params: {
				id: this.selectedId,
				templateId: this.record.data.templateId
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
//				this.loadUrl(this.iframe.dom.src);
//				
//				return;
				if (response.domId) {
					var el = this.getIframeEl(response.domId);
					el.addCls('mercury-region');
					el.set({
						'data-type': 'editable'
					});
					this.mercuryInstance.trigger('reinitialize');
					
				}
			}
		});
	}
	
});