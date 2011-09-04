<input type="file" id="dir-select" webkitdirectory />
<script>
Ext.onReady(function() {
	Ext.create('Modules.files.js.File', {
		id:'dir-select'
	});
});
</script>