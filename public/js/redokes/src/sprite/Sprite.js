Ext.define('Redokes.sprite.Sprite', {
	extend:'Ext.util.Observable',
	requires:[
		'Redokes.sprite.Animation'
	],
	
	game:false,
	context:false,
	
	img:false,
	isLoaded:false,
	currentFrame:0,
	width:0,
	height:0,
	
	animations:{},
	currentAnimation:false,
	animationSpeed:1,
	
	x:32,
	y:32,
	
	tileX:0,
	tileY:0,
	layer:0,
	
	constructor: function(params) {
		d('Sprite constructor');
		Ext.apply(this, params);
		this.currentAnimation = Ext.create('Redokes.sprite.Animation');
		this.init();
	},

	init: function() {
		// load the image
		if (this.img) {
			this.loadImage(this.img);
		}
		
		// set up the first frame animation
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'firstFrame',
			sequence:[0],
			fpf:1
		}));
		
		this.playAnimation('firstFrame');
		
//		this.setAnimationSpeed(this.animationSpeed);
	},
	
	loadImage: function(src) {
		d('Sprite load ' + src);
		this.isLoaded = false;
		this.img = Ext.get(new Image());
		this.img.on('load', this.imageLoaded, this);
		this.img.dom.src = src;
	},
	
	imageLoaded: function() {
		d('Sprite loaded ' + this.img.dom.src);
		this.isLoaded = true;
	},
	
	addAnimation: function(animation) {
		if (animation.title) {
			d('Sprite add animation ' + animation.title);
			this.animations[animation.title] = animation;
		}
	},
	
	playAnimation: function(newAnimationTitle, restartAnimation) {
		d('Sprite play animation ' + newAnimationTitle);
		restartAnimation = restartAnimation || false;
		if (this.currentAnimation.title != newAnimationTitle) {
			this.currentFrame = 0;
			this.currentAnimation = this.animations[newAnimationTitle];
		}
	},
	
	draw: function() {
		this.context.drawImage(this.img.dom, this.getFrame() * this.width, 0, this.width, this.height, this.x, this.y - 28, this.width, this.height);
	},
	
	getFrame: function() {
		return this.currentAnimation.sequence[(Math.round(this.game.frameCount / this.currentAnimation.fpf) % this.currentAnimation.sequence.length)];
	},

	setToTile: function(x, y, tileSize) {
		this.x = x * tileSize;
		this.y = y * tileSize;
	},

	setAnimationSpeed: function(speed) {
		this.animationSpeed = 30 / (speed*1.5);
		this.initAnimations();
	}
});