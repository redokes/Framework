Ext.define('Redokes.sprite.Player', {
	extend:'Redokes.sprite.Sprite',
	
	constructor: function() {
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
			sequence:[6],
			fpf:1
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'faceUp',
			sequence:[9],
			fpf:1
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'walkDown',
			sequence:[1,0,2,0],
			fpf:2.5
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'walkRight',
			sequence:[4,3,5,3],
			fpf:2.5
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'walkLeft',
			sequence:[7,6,8,6],
			fpf:2.5
		}));
		this.addAnimation(Ext.create('Redokes.sprite.Animation', {
			title:'walkUp',
			sequence:[10,9,11,9],
			fpf:2.5
		}));
	}

});