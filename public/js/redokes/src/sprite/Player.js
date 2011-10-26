Ext.define('Redokes.sprite.Player', {
	extend:'Redokes.sprite.Sprite',
	mixins: {
		log: 'Redokes.debug.Log'
	},
	
	playerData:{},
	doSocketCalls:false,
	
	getDefaultData: function() {
		var defaultData = {
			img:false,
			name:'Player',

			life:20,
			maxLife:20,
			lifePercent:100,
			mana:10,
			maxMana:10,
			manaPercent:100,

			speed:4,
			strength:3

		};
		return defaultData;
	},
	
	constructor: function() {
		this.setPlayerData(this.getDefaultData());
		this.callParent(arguments);
		this.addSprite(Ext.create('Redokes.sprite.PlayerStatus'));
	},
	
	save: function() {
//		console.log('save');
//		console.log(Ext.encode(this.playerData));
		localStorage['player ' + this.playerData.name] = Ext.encode(this.playerData);
	},
	
	load: function(name) {
		if (localStorage['player ' + name]) {
			this.setPlayerData(Ext.decode(localStorage['player ' + name]));
			this.socketSendPlayerData();
		}
		else {
			this.playerData.name = name;
		}
		this.save();
	},
	
	imageLoaded: function() {
		this.callParent(arguments);
		this.setPlayerData({
			img:this.getImageSrc()
		})
		if (this.doSocketCalls) {
			this.save();
			this.socketSendPlayerData();
		}
	},
	
	setPlayerData: function(data) {
		if (data.img && this.playerData.img != data.img) {
			this.loadImage(data.img);
		}
		Ext.apply(this.playerData, data);
	},
	
	socketSendPlayerData: function() {
//		console.log('socket send player data');
		
		//TODO: this is where it is erroring
//		return;
		this.log('Send player data');
		this.game.socket.socket.emit('setData', this.playerData, Ext.bind(function(params) {
//			console.log('call back from set data');
//			console.log(arguments);
			
		}));
	},
	
	initAnimations: function() {
		this.callParent(arguments);
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'faceDown',
			sequence:[0],
			fpf:1
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'faceRight',
			sequence:[3],
			fpf:1
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'faceLeft',
			sequence:[2],
			fpf:1
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'faceUp',
			sequence:[1],
			fpf:1
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'walkDown',
			sequence:[15,0,30,0],
			fpf:8
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'walkRight',
			sequence:[18,3,33,3],
			fpf:8
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'walkLeft',
			sequence:[17,2,32,2],
			fpf:8
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'walkUp',
			sequence:[16,1,31,1],
			fpf:8
		}));
	},
	
	setLife: function(value) {
		this.playerData.life = value;
		this.playerData.lifePercent = this.playerData.life / this.playerData.maxLife * 100;
	},
	
	setMana: function(value) {
		this.playerData.mana = value;
		this.playerData.manaPercent = this.playerData.mana / this.playerData.maxMana * 100;
	}
	

});