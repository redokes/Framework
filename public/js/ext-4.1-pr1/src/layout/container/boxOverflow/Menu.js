/**
 * @class Ext.layout.container.boxOverflow.Menu
 * @private
 */
Ext.define('Ext.layout.container.boxOverflow.Menu', {

    /* Begin Definitions */

    extend: 'Ext.layout.container.boxOverflow.None',
    requires: ['Ext.toolbar.Separator', 'Ext.button.Button'],
    alternateClassName: 'Ext.layout.boxOverflow.Menu',
    
    /* End Definitions */

    /**
     * @cfg {String} afterCtCls
     * CSS class added to the afterCt element. This is the element that holds any special items such as scrollers,
     * which must always be present at the rightmost edge of the Container
     */

    /**
     * @property noItemsMenuText
     * @type String
     * HTML fragment to render into the toolbar overflow menu if there are no items to display
     */
    noItemsMenuText : '<div class="' + Ext.baseCSSPrefix + 'toolbar-no-items">(None)</div>',

    constructor: function(layout) {
        var me = this;

        me.callParent(arguments);

        me.afterCtCls = me.afterCtCls || Ext.baseCSSPrefix + 'box-menu-' + layout.getNames().right;
        /**
         * @property menuItems
         * @type Array
         * Array of all items that are currently hidden and should go into the dropdown menu
         */
        me.menuItems = [];
    },

    beginLayout: function (ownerContext) {
        this.callParent(arguments);

        // Before layout, we need to re-show all items which we may have hidden due to a
        // previous overflow...
        this.clearOverflow();
    },

    beginLayoutCycle: function (ownerContext, firstCycle) {
        this.callParent(arguments);

        if (!firstCycle) {
            // if we are being re-run, we need to clear any overflow from the last run and
            // recache the childItems collection
            this.clearOverflow();

            this.layout.cacheChildItems(ownerContext);
        }
    },

    onRemove: function(comp){
        Ext.Array.remove(this.menuItems, comp);
    },

    // We don't define a prefix in menu overflow.
    getSuffixConfig: function() {
        var me = this,
            layout = me.layout,
            oid = layout.owner.id;

        /**
         * @private
         * @property menu
         * @type Ext.menu.Menu
         * The expand menu - holds items for every item that cannot be shown
         * because the container is currently not large enough.
         */
        me.menu = new Ext.menu.Menu({
            listeners: {
                scope: me,
                beforeshow: me.beforeMenuShow
            }
        });

        /**
         * @private
         * @property menuTrigger
         * @type Ext.button.Button
         * The expand button which triggers the overflow menu to be shown
         */
        me.menuTrigger = new Ext.button.Button({
            id      : oid + '-menu-trigger',
            style   : 'display:none',
            hidden  : true,
            ownerCt : layout.owner, // To enable the Menu to ascertain a valid zIndexManager owner in the same tree
            iconCls : Ext.baseCSSPrefix + layout.owner.getXType() + '-more-icon',
            ui      : layout.owner instanceof Ext.toolbar.Toolbar ? 'default-toolbar' : 'default',
            menu    : me.menu,
            getSplitCls: function() { return '';}
        });

        return {
            id  : oid + '-overflow-el',
            cls : Ext.layout.container.Box.prototype.innerCls + ' ' + me.afterCtCls,
            cn  : me.menuTrigger.getRenderTree()
        };
    },
    
    getOverflowCls: function() {
        return Ext.baseCSSPrefix + this.layout.direction + '-box-overflow-body';
    },

    handleOverflow: function(ownerContext) {
        var me = this,
            layout = me.layout,
            names = layout.getNames(),
            methodName = 'get' + names.widthCap,
            plan = ownerContext.state.boxPlan,
            posArgs = [null, null];

        me.captureChildElements();
        me.showTrigger(ownerContext);

        // Center the menuTrigger button.
        // TODO: Should we emulate align: 'middle' like this, or should we 'stretchmax' the menuTrigger?
        posArgs[names.heightIndex] = (plan.maxSize - me.menuTrigger['get' + names.heightCap]()) / 2;
        me.menuTrigger.setPosition.apply(me.menuTrigger, posArgs);

        return {
            reservedSpace: me.afterCt[methodName]()
        };
    },

    /**
     * @private
     * Captures reference to the the afterCt element and finishes the render operation of the trigger Button.
     */
    captureChildElements: function() {
        var me = this,
            el = me.layout.owner.el;

        if (!me.afterCt) {
            me.afterCt = el.getById(me.layout.owner.id + '-overflow-el');
            me.menuTrigger.finishRender();
        }
    },

    /**
     * @private
     * Called by the layout, when it determines that there is no overflow.
     * Also called as an interceptor to the layout's onLayout method to reshow
     * previously hidden overflowing items.
     */
    clearOverflow: function() {
        var me = this,
            items = me.menuItems,
            i = 0,
            length = items.length;

        me.hideTrigger();
        for (; i < length; i++) {
            items[i].show();
        }
        items.length = 0;
    },

    /**
     * @private
     * Shows the overflow trigger when enableOverflow is set to true and the items
     * in the layout are too wide to fit in the space available
     */
    showTrigger: function(ownerContext) {
        var me = this,
            layout = me.layout,
            names = layout.getNames(),
            startProp = names.x,
            sizeProp = names.width,
            plan = ownerContext.state.boxPlan,
            available = plan.targetSize[sizeProp],
            childItems = ownerContext.childItems,
            len = childItems.length,
            childContext,
            comp, i, props;

        me.menuTrigger.show();
        available -= me.afterCt.dom.offsetWidth;

        // Hide all items which are off the end, and store them to allow them to be restored
        // before each layout operation.
        me.menuItems.length = 0;
        for (i = 0; i < len; i++) {
            childContext = childItems[i];
            props = childContext.props;
            if (props[startProp] + props[sizeProp] > available) {
                comp = childContext.target;
                me.menuItems.push(comp);
                comp.hide();
                // TODO - we need a way to abort the layout for the now hidden child...
            }
        }
    },

    /**
     * @private
     */
    hideTrigger: function() {
        if (this.menuTrigger !== undefined) {
            this.menuTrigger.hide();
        }
    },

    /**
     * @private
     * Called before the overflow menu is shown. This constructs the menu's items, caching them for as long as it can.
     */
    beforeMenuShow: function(menu) {
        var me = this,
            items = me.menuItems,
            i = 0,
            len   = items.length,
            item,
            prev;

        var needsSep = function(group, prev){
            return group.isXType('buttongroup') && !(prev instanceof Ext.toolbar.Separator);
        };

        menu.suspendLayouts();
        me.clearMenu();
        menu.removeAll();

        for (; i < len; i++) {
            item = items[i];

            // Do not show a separator as a first item
            if (!i && (item instanceof Ext.toolbar.Separator)) {
                continue;
            }
            if (prev && (needsSep(item, prev) || needsSep(prev, item))) {
                menu.add('-');
            }

            me.addComponentToMenu(menu, item);
            prev = item;
        }

        // put something so the menu isn't empty if no compatible items found
        if (menu.items.length < 1) {
            menu.add(me.noItemsMenuText);
        }
        menu.resumeLayouts();
    },
    
    /**
     * @private
     * Returns a menu config for a given component. This config is used to create a menu item
     * to be added to the expander menu
     * @param {Ext.Component} component The component to create the config for
     * @param {Boolean} hideOnClick Passed through to the menu item
     */
    createMenuConfig : function(component, hideOnClick) {
        var config = Ext.apply({}, component.initialConfig),
            group  = component.toggleGroup;

        Ext.copyTo(config, component, [
            'iconCls', 'icon', 'itemId', 'disabled', 'handler', 'scope', 'menu'
        ]);

        Ext.apply(config, {
            text       : component.overflowText || component.text,
            hideOnClick: hideOnClick,
            destroyMenu: false
        });

        if (group || component.enableToggle) {
            Ext.apply(config, {
                group  : group,
                checked: component.pressed,
                listeners: {
                    checkchange: function(item, checked){
                        component.toggle(checked);
                    }
                }
            });
        }

        delete config.ownerCt;
        delete config.xtype;
        delete config.id;
        return config;
    },

    /**
     * @private
     * Adds the given Toolbar item to the given menu. Buttons inside a buttongroup are added individually.
     * @param {Ext.menu.Menu} menu The menu to add to
     * @param {Ext.Component} component The component to add
     */
    addComponentToMenu : function(menu, component) {
        var me = this;
        if (component instanceof Ext.toolbar.Separator) {
            menu.add('-');
        } else if (component.isComponent) {
            if (component.isXType('splitbutton')) {
                menu.add(me.createMenuConfig(component, true));

            } else if (component.isXType('button')) {
                menu.add(me.createMenuConfig(component, !component.menu));

            } else if (component.isXType('buttongroup')) {
                component.items.each(function(item){
                     me.addComponentToMenu(menu, item);
                });
            } else {
                menu.add(Ext.create(Ext.getClassName(component), me.createMenuConfig(component)));
            }
        }
    },

    /**
     * @private
     * Deletes the sub-menu of each item in the expander menu. Submenus are created for items such as
     * splitbuttons and buttongroups, where the Toolbar item cannot be represented by a single menu item
     */
    clearMenu : function() {
        var menu = this.moreMenu;
        if (menu && menu.items) {
            menu.items.each(function(item) {
                if (item.menu) {
                    delete item.menu;
                }
            });
        }
    },

    /**
     * @private
     */
    destroy: function() {
        Ext.destroy(this.menu, this.menuTrigger);
    }
});
