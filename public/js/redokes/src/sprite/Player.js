Ext.define('Redokes.sprite.Player', {
	extend:'Redokes.sprite.Sprite',
	
	playerData:{},
	
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
		this.playerData = {};
		this.setPlayerData(this.getDefaultData());
		this.callParent(arguments);
		this.addSprite(Ext.create('Redokes.sprite.PlayerStatus'));
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