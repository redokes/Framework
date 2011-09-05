<input type="file" id="dir-select" webkitdirectory />
<div id="tree-render"></div>
<script>
Ext.onReady(function() {
	Ext.create('Modules.files.js.File', {
		id:'dir-select'
	});
});
</script>