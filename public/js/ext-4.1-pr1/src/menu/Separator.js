/**
 * Adds a separator bar to a menu, used to divide logical groups of menu items. Generally you will
 * add one of these by using "-" in your call to add() or in your items config rather than creating one directly.
 *
 *     @example
 *     Ext.create('Ext.menu.Menu', {
 *         width: 100,
 *         height: 100,
 *         floating: false,  // usually you want this set to True (default)
 *         renderTo: Ext.getBody(),  // usually rendered by it's containing component
 *         items: [{
 *             text: 'icon item',
 *             iconCls: 'add16'
 *         },{
 *             xtype: 'menuseparator'
 *         },{
 *            text: 'seperator above',
 *         },{
 *            text: 'regular item',
 *         }]
 *     });
 */
Ext.define('Ext.menu.Separator', {
    extend: 'Ext.menu.Item',
    alias: 'widget.menuseparator',

    /**
     * @cfg {String} activeCls
     * Not applicable for Separator.
     */

    /**
     * @cfg {Boolean} canActivate
     * Not applicable for Separator.
     */
    canActivate: false,

    /**
     * @cfg {Boolean} clickHideDelay
     * Not applicable for Separator.
     */

    /**
     * @cfg {Boolean} destroyMenu
     * Not applicable for Separator.
     */

    /**
     * @cfg {Boolean} disabledCls
     * Not applicable for Separator.
     */

    focusable: false,

    /**
     * @cfg {String} href
     * Not applicable for Separator.
     */

    /**
     * @cfg {String} hrefTarget
     * Not applicable for Separator.
     */

    /**
     * @cfg {Boolean} hideOnClick
     * Not applicable for Separator.
     */
    hideOnClick: false,

    /**
     * @cfg {String} icon
     * Not applicable for Separator.
     */

    /**
     * @cfg {String} iconCls
     * Not applicable for Separator.
     */

    /**
     * @cfg {Object} menu
     * Not applicable for Separator.
     */

    /**
     * @cfg {String} menuAlign
     * Not applicable for Separator.
     */

    /**
     * @cfg {Number} menuExpandDelay
     * Not applicable for Separator.
     */

    /**
     * @cfg {Number} menuHideDelay
     * Not applicable for Separator.
     */

    /**
     * @cfg {Boolean} plain
     * Not applicable for Separator.
     */
    plain: true,

    /**
     * @cfg {String} separatorCls
     * The CSS class used by the separator item to show the incised line.
     */
    separatorCls: Ext.baseCSSPrefix + 'menu-item-separator',

    /**
     * @cfg {String} text
     * Not applicable for Separator.
     */
    text: '&#160;',

    beforeRender: function(ct, pos) {
        var me = this;

        me.callParent();

        me.addCls(me.separatorCls);
    }
});