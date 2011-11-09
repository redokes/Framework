/**
 *
 */
Ext.define('Redokes.panel.plugin.TabContextMenu', {
	extend: 'Ext.util.Observable',
	
	//Config
	
	// private
    init: function(panel) {
		this.panel = panel;
		
		this.panel.on('afterrender', function(){
			this.tabBar = this.panel.tabBar;
			if(this.tabBar == null){
				return;
			}
			if(this.tabBar.rendered){
				this.tabBar.getEl().on('contextmenu', this.onContextMenu, this);
			}
			else{
				this.tabBar.on('afterrender', function(){
					this.tabBar.getEl().on('contextmenu', this.onContextMenu, this);
				}, this);
			}
		}, this);
    },
	
	onContextMenu: function(event, element, options){
		//Prevent default
		event.preventDefault();
		
		//get the tab
		var tabEl = event.getTarget('.x-tab');
		if(!tabEl){
			return;
		}
		var tab = this.tabBar.getComponent(tabEl.id);
		
		//Show the menu
		var menu = new Ext.menu.Menu({
			items:[{
				scope: this,
				tab: tab,
				text: 'Close Other Tabs',
				handler: function(button){
					this.closeOtherTabs(button.tab);
				}
			},{
				scope: this,
				tab: tab,
				text: 'Close Tab',
				handler: function(button){
					this.closeTab(button.tab);
				}
			}]
		});
		
		//Show the menu
		menu.showAt(event.getXY());
	},
	
	closeOtherTabs: function(tab){
		this.tabBar.items.each(function(item){
			//Close if closable and not the passed tab
			if(item.closable && item != tab){
				this.panel.remove(item.card);
			}
		}, this);
	},
	
	closeTab: function(tab){
		if(tab.closable){
			this.panel.remove(tab.card);
		}
	}
});