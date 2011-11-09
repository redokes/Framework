Ext.define('Redokes.game.ImageManager', {
	extend: 'Ext.util.Observable',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	images: {},
	forceLoad: false,
	
	constructor: function() {
		this.addEvents('load');
		this.images = {};
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		
	},
	
	isLoaded: function(src) {
		return (this.images[src] == 'loaded');
	},
	
	loadImage: function(src) {
		if (this.images[src] == null) {
			this.initImage(src);
		}
		else if (this.images[src].status == 'loading') {
			
		}
		else if (this.images[src].status == 'loaded') {
			if (this.forceLoad) {
				delete this.images[src];
				this.initImage(src);
			}
		}
	},
	
	initImage: function(src) {
		this.images[src] = {
			img: Ext.get(new Image()),
			status: null
		};
		this.images[src].img.on('load', function(params) {
			this.images[src].status = 'loaded';
			this.fireEvent('load', params.img);
		}, this, {
			img: this.images[src].img
		});
		this.images[src].img.dom.src = src;
		this.images[src].status = 'loading';
	}
	
});