/**
 * @class Ext.layout.component.field.Slider
 * @private
 */

Ext.define('Ext.layout.component.field.Slider', {

    /* Begin Definitions */

    alias: ['layout.sliderfield'],

    extend: 'Ext.layout.component.field.Field',

    /* End Definitions */

    type: 'sliderfield',

    sizeBodyContents: function(width, height, ownerContext) {
        var me = this,
            owner = me.owner,
            thumbs = owner.thumbs,
            length = thumbs.length,
            endElContextItem = ownerContext.getEl('endEl'),
            endElPad = endElContextItem.getPaddingInfo(),
            inputContextItem = ownerContext.getEl('inputEl'),
            inputPad = inputContextItem.getPaddingInfo(),
            innerElContextItem = ownerContext.getEl('innerEl'),
            i = 0;

        /*
         * If we happen to be animating during a resize, the position of the thumb will likely be off
         * when the animation stops. As such, just stop any animations before syncing the thumbs.
         */
        for(; i < length; ++i) {
            thumbs[i].el.stopAnimation();
        }

        if (owner.vertical) {
            innerElContextItem.setHeight(height - inputPad.top - endElPad.bottom);
        } else {
            innerElContextItem.setWidth(width - inputPad.left - endElPad.right);
        }

        owner.syncThumbs();
    }
});
