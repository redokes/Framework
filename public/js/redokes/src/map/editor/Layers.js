Ext.define('Redokes.map.editor.Layers', {
	extend:'Ext.tree.Panel',
	
	title:'Layer Visibility',
	rootVisible:false,
	root:{
		expanded: true,
		children: [{
			text: 'Layer 1',
			checked:true,
			expanded:true,
			id:'layer-0',
			children:[{
				text: 'Tiles',
				id:'tiles-0',
				leaf: true,
				checked:true
			},{
				text: 'Walls',
				id:'walls-0',
				leaf: true,
				checked:true
			}]
		}, {
			text: 'Layer 2',
			checked:true,
			expanded:true,
			id:'layer-1',
			children:[{
				text: 'Tiles',
				id:'tiles-1',
				leaf: true,
				checked:true
			},{
				text: 'Walls',
				id:'walls-1',
				leaf: true,
				checked:true
			}]
		}, {
			text: 'Layer 3',
			checked:true,
			expanded:true,
			id:'layer-2',
			children:[{
				text: 'Tiles',
				id:'tiles-2',
				leaf: true,
				checked:true
			},{
				text: 'Walls',
				id:'walls-2',
				leaf: true,
				checked:true
			}]
		}, {
			text: 'Layer 4',
			checked:true,
			expanded:true,
			id:'layer-3',
			children:[{
				text: 'Tiles',
				id:'tiles-3',
				leaf: true,
				checked:true
			},{
				text: 'Walls',
				id:'walls-3',
				leaf: true,
				checked:true
			}]
		}, {
			text: 'Layer 5',
			checked:true,
			expanded:true,
			id:'layer-4',
			children:[{
				text: 'Tiles',
				id:'tiles-4',
				leaf: true,
				checked:true
			},{
				text: 'Walls',
				id:'walls-4',
				leaf: true,
				checked:true
			}]
		}]
	},
	
	initComponent: function() {
		this.items = this.items || [];
		
		this.callParent(arguments);
	}
});