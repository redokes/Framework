/**
 * Component layout for components which maintain an inner body element which must be resized to synchronize with the
 * Component size.
 * @class Ext.layout.component.Body
 * @private
 */

Ext.define('Ext.layout.component.Body', {

    /* Begin Definitions */

    alias: ['layout.body'],

    extend: 'Ext.layout.component.Auto',

    /* End Definitions */

    type: 'body',

    beginLayout: function (ownerContext) {
        this.callParent(arguments);

        ownerContext.bodyContext = ownerContext.getEl('body');
    },

    calculate: function(ownerContext) {
        // Subtle But Important:
        // 
        // We don't want to call getProp/hasProp et.al. unless we in fact need that value
        // for our results! If we call it and don't need it, the layout manager will think
        // we depend on it and will schedule us again should it change.

        var me = this,
            fixedHeight = ownerContext.heightAuthority > 0,
            fixedWidth  = ownerContext.widthAuthority > 0,
            height, width, bodyContext, frameInfo;

        me.callParent(arguments);

        bodyContext = ownerContext.bodyContext;
        frameInfo = ownerContext.getFrameInfo();

        // Either fix the body size based upon this Component's frame info (padding)
        // Or adjust this Componentts auto size, accounting for extra size added by the body's padding 
        if (fixedWidth) {
            width = ownerContext.getProp('width');
            if (width === undefined) {
                me.done = false;
            } else {
                bodyContext.setWidth(width - frameInfo.width);
            }
        }
        if (fixedHeight) {
            height = ownerContext.getProp('height');
            if (height === undefined) {
                me.done = false;
            } else {
               bodyContext.setHeight(height - frameInfo.height);
            }
        }
    },

    calculateOwnerHeightFromContentHeight: function (ownerContext, contentHeight) {
        return contentHeight + ownerContext.getFrameInfo().height;
    },

    calculateOwnerWidthFromContentWidth: function (ownerContext, contentWidth) {
        return contentWidth + ownerContext.getFrameInfo().width;
    },

    getContentWidth: function (ownerContext) {
        return ownerContext.bodyContext.el.dom.offsetWidth;
    },

    getContentHeight: function (ownerContext) {
        return ownerContext.bodyContext.el.dom.offsetHeight;
    },

    publishOwnerHeight: function (ownerContext, contentHeight) {
        this.callParent(arguments);

        ownerContext.bodyContext.setProp('height', contentHeight, false);
    },

    publishOwnerWidth: function (ownerContext, contentWidth) {
        this.callParent(arguments);

        ownerContext.bodyContext.setProp('width', contentWidth, false);
    }
});
