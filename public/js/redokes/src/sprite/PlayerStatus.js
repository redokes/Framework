Ext.define('Redokes.sprite.PlayerStatus', {
	extend:'Redokes.sprite.Sprite',
	
	draw: function() {
		this.callParent();
		
		// draw name
		this.context.fillStyle = '#fff'
		this.context.font = "bold 13px sans-serif";
		this.context.fillText(this.following.playerData.name, this.following.x, this.following.y-40);
		
		// draw life bar outline
		this.context.lineWidth = 1;
		this.context.strokeStyle = '#fff';
		this.context.strokeRect(this.following.x-9, this.following.y+20, 52, 14);
		
		// draw life bar
		this.context.fillStyle = '#f00';
		this.context.fillRect(this.following.x-8, this.following.y+21, this.following.playerData.lifePercent/2, 6);
		
		// draw mana bar
		this.context.fillStyle = '#00f';
		this.context.fillRect(this.following.x-8, this.following.y+27, this.following.playerData.manaPercent/2, 6);
	}

});