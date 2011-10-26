/**
 * Component layout for Tip/ToolTip/etc. components
 * @class Ext.layout.component.Tip
 * @private
 */

Ext.define('Ext.layout.component.Tip', {

    /* Begin Definitions */

    alias: ['layout.tip'],

    extend: 'Ext.layout.component.Dock',

    /* End Definitions */

    type: 'tip'

    // TODO - The logic commented out below won't work. At a minimum it has a "callParent"
    // in doLayout but there is no parent and it would not accept a size if there were. It
    // seems like this is all about correcting for autoWidth problems, but that really is
    // a problem w/dock layout and panel in general. That should include the positioning
    // trick as well. This is what the (perhaps ill-named) "boxParent" logic is all about.

    // In case we do need it, I've done just the position game in a way that works with the
    // layout sequence, but this should not be needed.

    /*
    beginLayout: function (ownerContext) {
        this.callParent(arguments);

        // Position offscreen so the natural width is not affected by the viewport's
        // right edge:

        var el = ownerContext.el;

        ownerContext.savedXY = el.getXY();

        el.setXY([-9999,-9999]);
    },

    finishedLayout: function (ownerContext) {
        this.callParent(arguments);

        // Restore position
        ownerContext.el.setXY(ownerContext.savedXY);
    }*/
    
    /*calculate: function(ownerContext) {
        var me = this,
            width, height;

        me.callParent(arguments);

        width = ownerContext.getProp('width');
        height = ownerContext.getProp('height');

        if (Ext.isNumber(width) && Ext.isNumber(height)) {
            ownerContext.queueFn(this, this.doLayout, [width, height]);
        } else {
            me.done = false;
        }
    },

    doLayout: function(width, height) {
        var me = this,
            owner = me.owner,
            el = owner.el,
            minWidth,
            maxWidth,
            naturalWidth,
            constrainedWidth,
            xy = el.getXY();

        // Position offscreen so the natural width is not affected by the viewport's right edge
        el.setXY([-9999,-9999]);

        // Handle min/maxWidth for auto-width tips
        if (!Ext.isNumber(width)) {
            minWidth = owner.minWidth;
            maxWidth = owner.maxWidth;
            // IE6/7 in strict mode have a problem doing an autoWidth
            if (Ext.isStrict && (Ext.isIE6 || Ext.isIE7)) {
                constrainedWidth = me.doAutoWidth();
            } else {
                naturalWidth = el.getWidth();
            }
            if (naturalWidth < minWidth) {
                constrainedWidth = minWidth;
            }
            else if (naturalWidth > maxWidth) {
                constrainedWidth = maxWidth;
            }
            if (constrainedWidth) {
                this.callParent([constrainedWidth, height]);  // OOPS - no parent to call
            }
        }

        // Restore position
        el.setXY(xy);
    },
    
    doAutoWidth: function(){
        var me = this,
            owner = me.owner,
            body = owner.body,
            width = body.getTextWidth();
            
        if (owner.header) {
            width = Math.max(width, owner.header.getWidth());
        }
        if (!Ext.isDefined(me.frameWidth)) {
            me.frameWidth = owner.el.getWidth() - body.getWidth();
        }
        width += me.frameWidth + body.getPadding('lr');
        return width;
    }*/
});
