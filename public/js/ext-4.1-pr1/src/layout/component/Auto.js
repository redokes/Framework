/**
 * @class Ext.layout.component.Auto
 * @private
 *
 * <p>The AutoLayout is the default layout manager delegated by {@link Ext.Component} to
 * render any child Elements when no <tt>{@link Ext.container.Container#layout layout}</tt> is configured.</p>
 */

Ext.define('Ext.layout.component.Auto', {

    /* Begin Definitions */

    alias: 'layout.autocomponent',

    extend: 'Ext.layout.component.Component',

    /* End Definitions */

    type: 'autocomponent',

    /**
     * @private
     * When publishing height of an auto Component, it is usually not written to the DOM.
     * Setting this to <code>true</code> overrides this behaviour.
     */
    setHeightInDom: false,

    
    /**
     * @private
     * When publishing width of an auto Component, it is usually not written to the DOM.
     * Setting this to <code>true</code> overrides this behaviour.
     */
    setWidthInDom: false,

    calculate: function(ownerContext) {
        var me = this,
            measurement = me.measureAutoDimensions(ownerContext);

        if (measurement.gotWidth) {
            me.publishOwnerWidth(ownerContext, measurement.contentWidth);
        }
        if (measurement.gotHeight) {
            me.publishOwnerHeight(ownerContext, measurement.contentHeight);
        }

        if (!measurement.gotAll) {
            me.done = false;
        }
    },

    calculateOwnerHeightFromContentHeight: function (ownerContext, contentHeight) {
        // OwnerContext padding is always added into contentHeight by all container layouts
        // so we must subtract it when adding the frameInfo to calculate the Component height
        // because frameInfo includes padding+framing+border
        return contentHeight - ownerContext.getPaddingInfo().height + ownerContext.getFrameInfo().height;
    },

    calculateOwnerWidthFromContentWidth: function (ownerContext, contentWidth) {
        // OwnerContext padding is always added into contentWidth by all container layouts
        // so we must subtract it when adding the frameInfo to calculate the Component width
        // because frameInfo includes padding+framing+border
        return contentWidth - ownerContext.getPaddingInfo().width + ownerContext.getFrameInfo().width;
    },

    publishOwnerHeight: function (ownerContext, contentHeight) {
        var me = this,
            owner = me.owner,
            height = me.calculateOwnerHeightFromContentHeight(ownerContext, contentHeight),
            constrainedHeight, dirty;

        if (isNaN(height)) {
            me.done = false;
        } else {
            constrainedHeight = Ext.Number.constrain(height, owner.minHeight, owner.maxHeight);

            if (constrainedHeight == height) {
                dirty = me.setHeightInDom;
            } else {
                ownerContext.autoHeight = false;
                ownerContext.heightAuthority = 1;
                height = constrainedHeight;
                // TODO: we might need to invalidate here...
            }

            ownerContext.setHeight(height, dirty);
        }
    },

    publishOwnerWidth: function (ownerContext, contentWidth) {
        var me = this,
            owner = me.owner,
            width = me.calculateOwnerWidthFromContentWidth(ownerContext, contentWidth),
            constrainedWidth, dirty;

        if (isNaN(width)) {
            me.done = false;
        } else {
            constrainedWidth = Ext.Number.constrain(width, owner.minWidth, owner.maxWidth);

            if (constrainedWidth == width) {
                dirty = me.setWidthInDom;
            } else {
                ownerContext.autoWidth = false;
                ownerContext.widthAuthority = 1;
                width = constrainedWidth;
                // TODO: we might need to invalidate here...
            }

            ownerContext.setWidth(width, dirty);
        }
    }
});
