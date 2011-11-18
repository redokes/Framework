/**
 * IframePanel is an extension of Ext.panel.Panel that uses an iframe
 * for the content. Provides a method to load other urls into the
 * iframe.
 * @constructor
 * @param {Object} config
 */
Ext.define('Redokes.panel.Iframe', {
	extend:'Ext.panel.Panel',
	
	iframe: false,
	iframeHtml: false,
	
	title: ' ',
	
	/**
	 * @cfg {String} url
	 * The initial URL to load after the IframeWindow is rendered
	 */
	url: false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.addEvents(
			/**
             * @event load
             * Fires when the iframe finished loading and after the normal
			 * dom iframe load event
             * @param {TMS.IframeWindow} iframeWindow The IframeWindow object
             */
			'load'
		);
		this.initIframe();
	},
	
	initIframe: function() {
		this.iframeHtml = Ext.core.DomHelper.markup({
			tag:'iframe',
			cls:'rate-confirmation-iframe',
			border:0,
			frameborder:0,
			width:'100%',
			height:'100%'
		});
		this.html = this.iframeHtml;
		this.on('afterrender', function(){
			this.iframe = this.getEl().down('iframe');
			this.setHeight(Ext.Element.getViewportHeight() * .8);
			this.setWidth(Ext.Element.getViewportWidth() * .9);
			if (this.url.length) {
				this.loadUrl(this.url);
			}
		}, this);
	},
	
	/**
	 * Loads a new URL in the iframe. Fires a 'load' event when the URL has
	 * been loaded.
	 * @param {String} url The url for the iframe to load
	 */
	loadUrl: function(url) {
		this.url = url;
		this.setLoading(true);
		
		this.iframe.on('load', function() {
			this.setLoading(false);
			this.fireEvent('load', this);
		}, this);
		this.iframe.dom.src = this.url;
	}
});