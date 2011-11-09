Ext.define("Modules.files.js.server.file.model.File", {
    extend: 'Ext.data.Model',
	fields:[
		'userSocketId',
		'socketId',
		'fileId',
		'request',
		'response',
		'content'
	]
});