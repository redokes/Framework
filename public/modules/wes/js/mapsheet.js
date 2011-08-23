Ext.EventManager.on(window, 'load', function() {
	Ext.select('.tile').on('click', function(e, el) {
		Ext.get(el).toggleCls('selected');
	});
	
	Ext.get('save').on('click', function() {
		var elements = Ext.select('.selected').elements;
		var num = elements.length;
		var str = '';
		var fileNames = [];
		for (var i = 0; i < num; i++) {
			var parts = elements[i].src.split('/');
			var fileName = parts[parts.length-1];
			str += fileName + "\n";
			fileNames.push(fileName);
		}
		Ext.get('output').update(str);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:'/wes/process/copy-tiles',
			params:{
				fileNames:Ext.encode(fileNames)
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				console.log(response);
			}
		});
	});
	
	Ext.get('update').on('click', function(e, el) {
		var value = Ext.get('output').dom.value;
		var parts = value.split("\n");
		var numParts = parts.length;
		for (var i = 0; i < numParts; i++) {
			var id = 'tile-' + parts[i];
			Ext.get(id).addCls('selected');
		}
	});
});