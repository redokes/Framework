Ext.define('Ext.focus.PanelNavigationHandler', {
    requires: ['Ext.panel.Panel']
}, function() {
    Ext.override(Ext.panel.Panel, {
        getFocusableComponents: function() {
            
        }
    });
});