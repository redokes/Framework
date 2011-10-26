/**
 * This class is intended to be extended or created via the {@link Ext.Component#componentLayout layout}
 * configuration property.  See {@link Ext.Component#componentLayout} for additional details.
 * @private
 */
Ext.define('Ext.layout.component.Component', {

    /* Begin Definitions */

    extend: 'Ext.layout.Layout',

    /* End Definitions */

    type: 'component',

    isComponentLayout: true,

    monitorChildren: true,

    nullBox: {},
    
    beginLayoutCycle: function (ownerContext, firstCycle) {
        var me = this,
            owner = me.owner,
            heightAuthority = ownerContext.heightAuthority,
            widthAuthority = ownerContext.widthAuthority,
            body = owner.el.dom === document.body,
            lastBox = ownerContext.lastBox || me.nullBox,
            dirty;

        me.callParent(arguments);

        // we want to publish configured dimensions as early as possible and since this is
        // a write phase...

        if (widthAuthority == 1) {
            // If the owner.el is the body, owner.width is not dirty (we don't want to write
            // it to the body el). For other el's, the width may already be correct in the
            // DOM (e.g., it is rendered in the markup initially). If the width is not
            // correct in the DOM, this is only going to be the case on the first cycle.

            dirty = !body && firstCycle && owner.width !== lastBox.width;
            
            ownerContext.setWidth(owner.width, dirty);
        } else if (ownerContext.isTopLevel && widthAuthority) {
            ownerContext.setWidth(me.lastComponentSize.width, /*dirty=*/false, /*force=*/true);
        }

        if (heightAuthority == 1) {
            dirty = !body && firstCycle && owner.height !== lastBox.height;
            ownerContext.setHeight(owner.height, dirty);
        } else if (ownerContext.isTopLevel && heightAuthority) {
            ownerContext.setHeight(me.lastComponentSize.height, false, true);
        }
    },

    finishedLayout: function(ownerContext) {
        var me = this,
            elementChildren = ownerContext.children,
            len, i, elContext;

        // NOTE: In the code below we cannot use getProp because that will generate a layout dependency

        // Set lastBox on managed child Elements.
        // So that ContextItem.constructor can snag the lastBox for use by its undo method.
        if (elementChildren) {
            len = elementChildren.length;
            for (i = 0; i < len; i++) {
                elContext = elementChildren[i];
                elContext.el.lastBox = elContext.props;
            }
        }

        // Cache the size from which we are changing so that notifyOwner can notify the owningComponent with all essential information
        ownerContext.previousSize = me.lastComponentSize;

        // Cache the currently layed out size
        me.owner.lastBox = me.lastComponentSize = ownerContext.props;
    },
    
    notifyOwner: function(ownerContext) {
        var me = this,
            currentSize = me.lastComponentSize,
            prevSize = ownerContext.previousSize,
            args = [currentSize.width, currentSize.height];

        if (prevSize) {
            args.push(prevSize.width, prevSize.height);
        }
        
        // Call afterComponentLayout passing new size, and only passing old size if there *was* an old size.
        me.owner.afterComponentLayout.apply(me.owner, args);
    },

    /**
     * Check if the new size is different from the current size and only
     * trigger a layout if it is necessary.
     * @param {Number} width The new width to set.
     * @param {Number} height The new height to set.
     */
    needsLayout : function(width, height) {
        var me = this,
            widthBeingChanged,
            heightBeingChanged;
            me.lastComponentSize = me.lastComponentSize || {
                width: -Infinity,
                height: -Infinity
            };
        
        // If autoWidthing, or an explicitly different width is passed, then the width is being changed.
        widthBeingChanged  = !Ext.isDefined(width)  || me.lastComponentSize.width  !== width;

        // If autoHeighting, or an explicitly different height is passed, then the height is being changed.
        heightBeingChanged = !Ext.isDefined(height) || me.lastComponentSize.height !== height;


        // Return true if the managed Component needs to be layed out.
        return (me.childrenChanged || widthBeingChanged || heightBeingChanged);
    },

    /**
     * Returns the owner component's resize element.
     * @return {Ext.Element}
     */
    getTarget : function() {
        return this.owner.el;
    },

    /**
     * Returns the element into which rendering must take place. Defaults to the owner Component's encapsulating element.
     *
     * May be overridden in Component layout managers which implement an inner element.
     * @return {Ext.Element}
     */
    getRenderTarget : function() {
        return this.owner.el;
    },

    cacheTargetInfo: function(ownerContext) {
        var me = this,
            targetInfo = me.targetInfo,
            target, body;

        if (!targetInfo) {
            target = ownerContext.getEl('getTarget', me);
            body = ownerContext.getEl('getTargetEl');

            me.targetInfo = targetInfo = {
                padding: target.getPaddingInfo(),
                border: target.getBorderInfo()
            };
        }

        return targetInfo;
    },

    measureAutoDimensions: function (ownerContext, dimensions) {
        // Subtle But Important:
        // 
        // We don't want to call getProp/hasProp et.al. unless we in fact need that value
        // for our results! If we call it and don't need it, the layout manager will think
        // we depend on it and will schedule us again should it change.

        var me = this,
            owner = me.owner,
            autoHeight = ownerContext.autoHeight,
            autoWidth  = ownerContext.autoWidth,
            boxParent = ownerContext.boxParent,
            isBoxParent = ownerContext.isBoxParent,
            state = ownerContext.state,
            ret = {
                gotWidth: false,
                gotHeight: false,
                isContainer: !ownerContext.hasRawContent
            },
            hv = dimensions || 3,
            zeroWidth = !(hv & 1),
            zeroHeight = !(hv & 2),
            needed = 0,
            got = 0,
            ready, size;

        if (ret.isContainer) {
            if (autoHeight) {
                ++needed;

                // don't ask unless we need to know...
                if (zeroHeight) {
                    ret.contentHeight = 0;
                    ret.gotHeight = true;
                    ++got;
                } else if ((ret.contentHeight = ownerContext.getProp('contentHeight')) !== undefined) {
                    ret.gotHeight = true;
                    ++got;
                }
            }

            if (autoWidth) {
                ++needed;

                // don't ask unless we need to know...
                if (zeroWidth) {
                    ret.contentWidth = 0;
                    ret.gotWidth = true;
                    ++got;
                } else if ((ret.contentWidth = ownerContext.getProp('contentWidth')) !== undefined) {
                    ret.gotWidth = true;
                    ++got;
                }
            }
        } else {
            // This is the 98% use case of auto-sizing
            if (autoHeight) {
                ++needed;

                size = ownerContext.props.contentHeight;
                if (typeof size == 'number') { // if (already determined)
                    ret.contentHeight = size;
                    ret.gotHeight = true;
                    ++got;
                } else {
                    if (zeroHeight || ownerContext.target.noWrap) {
                        ready = true;
                    } else if (!autoWidth || owner.minWidth !== undefined || owner.maxWidth !== undefined) {
                        // fixed width, so we need the width to determine the height...
                        ready = ownerContext.hasDomProp('width');
                    } else if (isBoxParent || !boxParent || boxParent.autoWidth) {
                        // if we have no boxParent, we are ready, but an autoWidth boxParent
                        // artificially provides width early in the measurement process so
                        // we are ready to go in that case as well...
                        ready = true;
                    } else {
                        // lastly, we have a boxParent that will be given a width, so we
                        // can wait for that width to be set in order to properly measure
                        // whatever is inside...
                        ready = boxParent.hasDomProp('width');
                    }

                    if (ready) {
                        ret.contentHeight = zeroHeight ? 0 : me.getContentHeight(ownerContext);
                        ownerContext.setContentHeight(ret.contentHeight, true);
                        ret.gotHeight = true;
                        ++got;
                    }
                }
            }

            // A minority use case, but often occurs with autoHeight... also useful for
            // things like images
            if (autoWidth) {
                ++needed;

                size = ownerContext.props.contentWidth;
                if (typeof size == 'number') { // if (already determined)
                    ret.contentWidth = size;
                    ret.gotWidth = true;
                    ++got;
                } else {
                    if (zeroWidth) {
                        ready = true;
                    } else if (isBoxParent || !boxParent || boxParent.autoWidth) {
                        // if we have no boxParent, we are ready, but an autoWidth boxParent
                        // artificially provides width early in the measurement process so
                        // we are ready to go in that case as well...
                        ready = true;
                    } else {
                        // lastly, we have a boxParent that will be given a width, so we
                        // can wait for that width to be set in order to properly measure
                        // whatever is inside...
                        ready = boxParent.hasDomProp('width');
                    }

                    if (ready) {
                        ret.contentWidth = zeroWidth ? 0 : me.getContentWidth(ownerContext);
                        ownerContext.setContentWidth(ret.contentWidth, true);
                        ret.gotWidth = true;
                        ++got;
                    }
                }
            }

            if (boxParent && boxParent.autoWidth && !state.boxMeasured && ownerContext.measuresBox) {
                // since an autoWidth boxParent is holding a width on itself to allow each
                // child to measure
                state.boxMeasured = 1; // best to only call once per child
                boxParent.boxChildMeasured();
            }
        }

        // TODO - enforce min/maxHeight and min/maxWidth?

        ret.gotAll = got == needed;
        // see if we can avoid calling this method by storing something on ownerContext.
        return ret;
    },

    getContentWidth: function (ownerContext) {
        // contentWidth includes padding, but not border, framing or margins
        return ownerContext.el.getWidth() + ownerContext.getPaddingInfo().width - ownerContext.getFrameInfo().width;
    },

    getContentHeight: function (ownerContext) {
        // contentHeight includes padding, but not border, framing or margins
        return ownerContext.el.getHeight() + ownerContext.getPaddingInfo().height - ownerContext.getFrameInfo().height;
    }
});
