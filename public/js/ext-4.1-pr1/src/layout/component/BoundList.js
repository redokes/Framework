/**
 * Component layout for {@link Ext.view.BoundList}. Handles constraining the height to the configured maxHeight.
 * @class Ext.layout.component.BoundList
 * @private
 */
Ext.define('Ext.layout.component.BoundList', {
    extend: 'Ext.layout.component.Component',
    alias: 'layout.boundlist',

    type: 'component',

    beforeLayout: function() {
        return this.callParent(arguments) || this.owner.refreshed > 0;
    },
    
    beginLayout: function(ownerContext) {
        if (this.owner.pagingToolbar && !ownerContext.toolbarContext) {
            ownerContext.toolbarContext = ownerContext.context.getCmp(this.owner.pagingToolbar);
        }
    },

    getLayoutItems: function() {
        return this.owner.pagingToolbar ? [ this.owner.pagingToolbar ] : [];
    },

    calculate : function(ownerContext) {
        var me = this,
            owner = me.owner,
            width = owner.width,
            height = owner.height,
            floating = owner.floating,
            el = owner.el,
            xy = el.getXY(),
            isNumber = Ext.isNumber,
            minWidth, maxWidth, minHeight, maxHeight,
            naturalWidth, naturalHeight, constrainedWidth, constrainedHeight;

        if (floating) {
            // Position offscreen so the natural width is not affected by the viewport's right edge
            el.setXY([-9999,-9999]);
        }

        // Calculate initial layout
        me.setTargetSize(ownerContext, width, height);

        // Handle min/maxWidth for auto-width
        if (!isNumber(width)) {
            minWidth = owner.minWidth;
            maxWidth = owner.maxWidth;
            if (isNumber(minWidth) || isNumber(maxWidth)) {
                naturalWidth = el.getWidth();
                if (naturalWidth < minWidth) {
                    constrainedWidth = minWidth;
                }
                else if (naturalWidth > maxWidth) {
                    constrainedWidth = maxWidth;
                }
                if (constrainedWidth) {
                    me.setTargetSize(ownerContext, constrainedWidth);
                }
            }
        }
        // Handle min/maxHeight for auto-height
        if (!isNumber(height)) {
            minHeight = owner.minHeight;
            maxHeight = owner.maxHeight;
            if (isNumber(minHeight) || isNumber(maxHeight)) {
                naturalHeight = el.getHeight();
                if (naturalHeight < minHeight) {
                    constrainedHeight = minHeight;
                }
                else if (naturalHeight > maxHeight) {
                    constrainedHeight = maxHeight;
                }
                if (constrainedHeight) {
                    me.setTargetSize(ownerContext, undefined, constrainedHeight);
                }
            }
        }

        if (floating) {
            // Restore position
            el.setXY(xy);
        }
    },

    afterLayout: function() {
        var me = this,
            toolbar = me.owner.pagingToolbar;
        me.callParent();
        if (toolbar) {
            toolbar.doComponentLayout();
        }
    },

    setTargetSize : function(ownerContext, width, height) {
        var me = this,
            owner = me.owner,
            listHeight = null,
            toolbar;

        // Size the listEl
        if (Ext.isNumber(height)) {
            listHeight = height - ownerContext.getFrameInfo().height;
            toolbar = owner.pagingToolbar;
            if (toolbar) {
                listHeight -= ownerContext.toolbarContext.getProp('height');
            }
        }

        //me.setElementSize(owner.listEl, null, listHeight);
        ownerContext.getEl('listEl').setHeight(listHeight);

        ownerContext.setSize(width, height);
    }
});
