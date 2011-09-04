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
	facing:0,
	
	tileX:0,
	tileY:0,
	layer:0,
	
	numSprites:0,
	sprites:false,
	following:false,
	visible:true,
	
	constructor: function(params) {
		d('Sprite constructor');
		Ext.apply(this, params);
		this.sprites = [];
		this.currentAnimation = Ext.create('Redokes.sprite.Animation');
		this.init();
	},

	init: function() {
		// load the image
		if (this.img) {
			this.loadImage(this.img);
		}
		
		this.initAnimations();
		this.playAnimation('firstFrame');
//		this.setAnimationSpeed(this.animationSpeed);
	},
	
	initAnimations: function() {
		// set up the first frame animation
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'firstFrame',
			sequence:[0],
			fpf:1
		}));
	},
	
	loadImage: function(src) {
		d('Sprite load ' + src);
		this.isLoaded = false;
		this.img = Ext.get(new Image());
		this.img.on('load', this.imageLoaded, this);
		this.img.dom.src = src;
	},
	
	getImageSrc: function() {
		if (this.img) {
			return this.img.dom.src;
		}
		else {
			return false;
		}
	},
	
	imageLoaded: function() {
		d('Sprite loaded ' + this.img.dom.src);
		this.isLoaded = true;
	},
	
	addAnimation: function(animation) {
		if (animation.title) {
//			d('Sprite add animation ' + animation.title);
			this.animations[animation.title] = animation;
		}
	},
	
	playAnimation: function(newAnimationTitle, restartAnimation) {
		restartAnimation = restartAnimation || false;
		if (this.currentAnimation.title != newAnimationTitle) {
//			d('Sprite play animation ' + newAnimationTitle);
			this.currentFrame = 0;
			this.currentAnimation = this.animations[newAnimationTitle];
		}
	},
	
	draw: function() {
		if (this.visible) {
			try {
				if (this.following) {
					if (this.img) {
						this.context.drawImage(this.img.dom, this.getFrame() * this.width, 0, this.width, this.height, this.following.x, this.following.y-32, this.width, this.height);
					}
				}
				else {
					if (this.img) {
						this.context.drawImage(this.img.dom, this.getFrame() * this.width, 0, this.width, this.height, this.x, this.y-32, this.width, this.height);
					}
				}
			}
			catch(e) {
				console.log(e);
			}
			
			// draw any child sprites
			for (var i = 0; i < this.numSprites; i++) {
				this.sprites[i].draw();
			}
		}
	},
	
	getFrame: function() {
		return this.currentAnimation.sequence[(Math.round(this.game.frameCount / this.currentAnimation.fpf) % this.currentAnimation.sequence.length)];
	},

	setToTile: function(x, y, layer, tileSize) {
		this.layer = layer;
		this.tileX = x;
		this.tileY = y;
		this.x = x * tileSize;
		this.y = y * tileSize;
		
		this.dx = 0;
		this.dy = 0;
		this.destinationX = x;
		this.destinationY = y;
	},

	setAnimationSpeed: function(speed) {
		this.animationSpeed = 30 / (speed*1.5);
//		this.initAnimations();
	},
	
	addSprite: function(sprite) {
		sprite.following = this;
		sprite.context = this.context;
		this.sprites.push(sprite);
		this.numSprites = this.sprites.length;
	}
});