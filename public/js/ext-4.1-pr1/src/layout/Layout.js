/**
 * Base Layout class - extended by ComponentLayout and ContainerLayout
 */
Ext.define('Ext.layout.Layout', {

    requires: [
        'Ext.XTemplate'
    ],

    uses: [ 'Ext.layout.Context' ],

    /* Begin Definitions */

    /* End Definitions */

    isLayout: true,
    initialized: false,

    autoSizePolicy: {
        setsWidth: 0,
        setsHeight: 0
    },

    statics: {
        layoutsByType: {},

        create: function(layout, defaultType) {
            var ClassManager = Ext.ClassManager,
                layoutsByType = this.layoutsByType,
                alias, className, config, layoutClass, type, load;

            if (!layout || typeof layout === 'string') {
                type = layout || defaultType;
                config = {};                    
            } else if (layout.isLayout) {
                return layout;
            } else {
                config = layout;
                type = layout.type || defaultType;
            }

            if (!(layoutClass = layoutsByType[type])) {
                alias = 'layout.' + type;
                className = ClassManager.getNameByAlias(alias);

                // this is needed to support demand loading of the class
                if (!className) {
                    load = true;
                }
                
                layoutClass = ClassManager.get(className);
                if (load || !layoutClass) {
                    return ClassManager.instantiateByAlias(alias, config || {});
                }
                layoutsByType[type] = layoutClass;
            }

            return new layoutClass(config);
        }
    },

    constructor : function(config) {
        var me = this;

        me.id = Ext.id(null, me.type + '-');
        Ext.apply(me, config);
        me.layoutCount = 0;
    },

    /**
     * @property {Boolean} done Used only during a layout run, this value indicates that a
     * layout has finished its calculations. This flag is set to true prior to the call to
     * {@link #calculate} and should be set to false if this layout has more work to do.
     */

    /**
     * Called before any calculation cycles to prepare for layout.
     * 
     * This is a write phase and DOM reads should be strictly avoided when overridding
     * this method.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method beginLayout
     */
    beginLayout: Ext.emptyFn,

    /**
     * Called before any calculation cycles to reset DOM values and prepare for calculation.
     * 
     * This is a write phase and DOM reads should be strictly avoided when overridding
     * this method.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method beginLayoutCycle
     */
    beginLayoutCycle: Ext.emptyFn,

    /**
     * Called to perform the calculations for this layout. This method will be called at
     * least once and may be called repeatedly if the {@link #done} property is cleared
     * before return to indicate that this layout is not yet done. The {@link #done} property
     * is always set to `true` before entering this method.
     * 
     * This is a read phase and DOM writes should be strictly avoided in derived classes.
     * Instead, DOM writes need to be written to {@link Ext.layout.ContextItem} objects to
     *  be flushed at the next opportunity.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method calculate
     * @abstract
     */

    /**
     * This method (if implemented) is called at the end of the cycle in which this layout
     * completes (by not setting {@link #done} to `false` in {@link #calculate}). It is
     * possible for the layout to complete and yet become invalid before the end of the cycle,
     * in which case, this method will not be called. It is also possible for this method to
     * be called and then later the layout becomes invalidated. This will result in
     * {@link #calculate} being called again, followed by another call to this method.
     * 
     * This is a read phase and DOM writes should be strictly avoided in derived classes.
     * Instead, DOM writes need to be written to {@link Ext.layout.ContextItem} objects to
     * be flushed at the next opportunity.
     * 
     * This method need not be implemented by derived classes and, in fact, should only be
     * implemented when needed.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method completeLayout
     */

    /**
     * This method (if implemented) is called after all layouts have completed. In most
     * ways this is similar to {@link #completeLayout}. This call can cause this (or any
     * layout) to be become invalid (see {@link Ext.layout.Context#invalidate}), but this
     * is best avoided. This method is intended to be where final reads are made and so it
     * is best to avoidinvalidating layouts at this point whenever possible. Even so, this
     * method can be used to perform final checks that may require all other layouts to be
     * complete and then invalidate some results.
     * 
     * This is a read phase and DOM writes should be strictly avoided in derived classes.
     * Instead, DOM writes need to be written to {@link Ext.layout.ContextItem} objects to
     * be flushed at the next opportunity.
     * 
     * This method need not be implemented by derived classes and, in fact, should only be
     * implemented when needed.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method finalizeLayout
     */

    /**
     * This method (if implemented) is called after all layouts are complete and their
     * calculations flushed to the DOM. No further layouts will be run and this method
     * is only called once per layout run. The base implementation for component layouts
     * caches the `lastComponentSize` box.
     * 
     * This is a write phase and DOM reads should be avoided if possible when overridding
     * this method.
     * 
     * This method need not be implemented by derived classes and, in fact, should only be
     * implemented when needed.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     */
    finishedLayout: Ext.emptyFn,
    
    /**
     * This method (if implemented) is called after all layouts are finished, and all have
     * a `lastComponentSize` cached. No further layouts will be run and this method is only
     * called once per layout run. It is the bookend to {@link #beginLayout}.
     * 
     * This is a write phase and DOM reads should be avoided if possible when overridding
     * this method. This is the catch-all tail method to a layout and so the rules are more
     * relaxed. Even so, for performance reasons, it is best to avoid reading the DOM. If
     * a read is necessary, consider implementing a {@link #finalizeLayout} method to do the
     * required reads.
     * 
     * This method need not be implemented by derived classes and, in fact, should only be
     * implemented when needed.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method notifyOwner
     */
    
    redoLayout: Ext.emptyFn,
    undoLayout: Ext.emptyFn,

    getAnimatePolicy: function() {
        return this.animatePolicy;
    },

    /**
     * Returns an object describing how this layout manages the size of the given component.
     * This method must be implemented by any layout that manages components.
     *
     * @param {Ext.Component} item
     *
     * @return {Object} An object describing the sizing done by the layout for this item.
     *
     * @return {Boolean} return.readsWidth True if the natural/auto width of this component
     * is used by the ownerLayout.
     *
     * @return {Boolean} return.readsHeight True if the natural/auto height of this component
     * is used by the ownerLayout.
     *
     * @return {Number} return.setsWidth One of these values:
     * 
     *   - 1: The ownerLayout will set this component's width.
     *   - 0: The ownerLayout will NOT set this component's width.
     *   - -1: The ownerLayout will set this component's width ONLY IF the ownerCt has a
     *     fixed width.
     *
     * @return {Number} return.setsHeight One of the same values for setsWidth except
     * this value applies to height.
     *
     * @protected
     */
    getItemSizePolicy: function (item) {
        return this.autoSizePolicy;
    },

    isItemBoxParent: function (itemContext) {
        return false;
    },

    //-----------------------------------------------------
    /*
     * Clears any styles which must be cleared before layout can take place.
     * Only DOM WRITES must be performed at this stage.
     *
     * An entry for the owner's element ID must be created in the layoutContext containing
     * a reference to the target which must be sized/positioned/styled by the layout at
     * the flush stage:
     *
     *     {
     *         target: me.owner
     *     }
     *
     * Component layouts should iterate through managed Elements,
     * pushing an entry for each element:
     *
     *     {
     *         target: childElement
     *     }
     */
    //-----------------------------------------------------

    getItemsRenderTree: function (items) {
        var length = items.length,
            i, item, tree;

        if (length) {
            tree = [];
            for (i = 0; i < length; ++i) {
                item = items[i];
                // Perform layout preprocessing in the bulk render path
                this.configureItem(item);
                tree.push(item.getRenderTree());
            }
        }

        return tree;
    },

    finishRender: Ext.emptyFn,

    finishRenderItems: function (target, items) {
        var length = items.length,
            i, item;

        for (i = 0; i < length; i++) {
            item = items[i];

            // Only postprocess items which are being rendered. deferredRender may mean that only one has been rendered.
            if (item.rendering) {
                item.finishRender();

                this.afterRenderItem(item);
            }
        }
    },

    renderChildren: function () {
        var me = this,
            items = me.getLayoutItems(),
            target = me.getRenderTarget();

        me.renderItems(items, target);
    },

    /**
     * Iterates over all passed items, ensuring they are rendered.  If the items are already rendered,
     * also determines if the items are in the proper place in the dom.
     * @protected
     */
    renderItems : function(items, target) {
        var me = this,
            ln = items.length,
            i = 0,
            item;

        if (ln) {
            Ext.suspendLayouts();
            for (; i < ln; i++) {
                item = items[i];
                if (item && !item.rendered) {
                    me.renderItem(item, target, i);
                } else if (!me.isValidParent(item, target, i)) {
                    me.moveItem(item, target, i);
                } else {
                    // still need to configure the item, it may have moved in the container.
                    me.configureItem(item);
                }
            }
            Ext.resumeLayouts(true);
        }
    },

    /**
     * Validates item is in the proper place in the dom.
     * @protected
     */
    isValidParent : function(item, target, position) {
        var itemDom = item.el ? item.el.dom : Ext.getDom(item),
            targetDom = (target && target.dom) || target;

        if (itemDom && targetDom) {
            if (typeof position == 'number') {
                return itemDom == targetDom.childNodes[position];
            }
            return itemDom.parentNode == targetDom;
        }

        return false;
    },

    /**
     * Called before an item is rendered to allow the layout to configure the item.
     * @param {Ext.Component} item The item to be configured
     * @protected
     */
    configureItem: function(item) {
        item.ownerLayout = this;
    },

    /**
     * Renders the given Component into the target Element.
     * @param {Ext.Component} item The Component to render
     * @param {Ext.dom.Element} target The target Element
     * @param {Number} position The position within the target to render the item to
     * @private
     */
    renderItem : function(item, target, position) {
        if (!item.rendered) {
            this.configureItem(item);
            item.render(target, position);
            this.afterRenderItem(item);
            this.childrenChanged = true;
        }
    },

    /**
     * Moves Component to the provided target instead.
     * @private
     */
    moveItem : function(item, target, position) {
        // Make sure target is a dom element
        target = target.dom || target;
        if (typeof position == 'number') {
            position = target.childNodes[position];
        }
        target.insertBefore(item.el.dom, position || null);
        item.container = Ext.get(target);
        this.configureItem(item);
        this.childrenChanged = true;
    },

    /**
     * A one-time initialization method called just before rendering.
     * @protected
     */
    initLayout : function() {
        this.initialized = true;
    },

    // @private Sets the layout owner
    setOwner : function(owner) {
        this.owner = owner;
    },

    /**
     * Returns the set of items to layout (empty by default).
     * @protected
     */
    getLayoutItems : function() {
        return [];
    },

    // Placeholder empty functions for subclasses to extend
    afterLayout : Ext.emptyFn,
    afterRenderItem: Ext.emptyFn,
    onAdd : Ext.emptyFn,
    onRemove : Ext.emptyFn,
    onDestroy : Ext.emptyFn,

    /**
     * Removes layout's itemCls and owning Container's itemCls.
     * Clears the managed dimensinos flags
     * @protected
     */
    afterRemove : function(item) {
        var me = this,
            el = item.el,
            owner = me.owner,
            removeClasses = [];

        if (item.rendered) {
            if (me.itemCls) {
                removeClasses.push(me.itemCls);
            }
            if (owner.itemCls) {
                removeClasses.push(owner.itemCls);
            }
            if (removeClasses.length) {
                el.removeCls(removeClasses);
            }
        }

        delete item.ownerLayout;
    },

    /**
     * Destroys this layout. This method removes a `targetCls` from the `target`
     * element and calls `onDestroy`.
     * 
     * A derived class can override either this method or `onDestroy` but in all
     * cases must call the base class versions of these methods to allow the base class to
     * perform its cleanup.
     * 
     * This method (or `onDestroy`) are overridden by subclasses most often to purge
     * event handlers or remove unmanged DOM nodes.
     *
     * @protected
     */
    destroy : function() {
        var me = this;

        if (me.targetCls) {
            var target = me.getTarget();
            if (target) {
                target.removeCls(me.targetCls);
            }
        }

        me.onDestroy();
    },

    sortWeightedItems: function (items, reverseProp) {
        for (var i = 0, length = items.length; i < length; ++i) {
            items[i].$i = i;
        }

        Ext.Array.sort(items, function (item1, item2) {
            var ret = item2.weight - item1.weight;

            if (!ret) {
                ret = item1.$i - item2.$i;
                if (item1[reverseProp]) {
                    ret = -ret;
                }
            }

            return ret;
        });

        for (i = 0; i < length; ++i) {
            delete items[i].$i;
        }
    }
});
