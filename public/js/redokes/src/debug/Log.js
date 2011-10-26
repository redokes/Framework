Ext.define('Redokes.debug.Log', {
	
	statics: {
		lastCls: false
	},
	
	doOutput: false,
	
	log: function(str) {
		if (this.doOutput) {
			var lastCls = Redokes.debug.Log.lastCls;
			var thisCls = this.self.getName();
			if (lastCls != thisCls) {
				Redokes.debug.Log.lastCls = thisCls;
				console.log(this.self.getName());
			}
			if (typeof str == 'object') {
				console.log(">>");
				console.log(str);
			}
			else {
				console.log(">> " + str);
			}
		}
	},
	
	hideLog: function() {
		this.doOutput = false;
	},
	
	showLog: function() {
		this.doOutput = true;
	}
	
});