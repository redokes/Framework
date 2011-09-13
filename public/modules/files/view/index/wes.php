<script>
Ext.onReady(function() {
	var client = Ext.create('Redokes.socket.client.Client', {
		url:'http://localhost:8080'
	});
	
	var wesHandler = Ext.create('Redokes.socket.client.Handler', {
		client:client,
		module:'wes',
		actions:{
			testing: function() {
				console.log('this is the testing function');
				console.log(arguments);
			}
		}
	});
	
	window.client = client;
});
</script>