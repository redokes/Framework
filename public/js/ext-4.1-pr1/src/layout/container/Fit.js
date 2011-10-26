/**
 * This is a base class for layouts that contain a single item that automatically expands to fill the layout's
 * container. This class is intended to be extended or created via the layout:'fit'
 * {@link Ext.container.Container#layout} config, and should generally not need to be created directly via the new keyword.
 *
 * Fit layout does not have any direct config options (other than inherited ones). To fit a panel to a container using
 * Fit layout, simply set `layout: 'fit'` on the container and add a single panel to it.
 *
 *     @example
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Fit Layout',
 *         width: 300,
 *         height: 150,
 *         layout:'fit',
 *         items: {
 *             title: 'Inner Panel',
 *             html: 'This is the inner panel content',
 *             bodyPadding: 20,
 *             border: false
 *         },
 *         renderTo: Ext.getBody()
 *     });
 * 
 * If the container has multiple items, all of the items will all be equally sized. This is usually not
 * desired, so to avoid this, place only a **single** item in the container. This sizing of all items
 * can be used to provide a background {@link Ext.Img image} that is "behind" another item
 * such as a {@link Ext.view.View dataview} if you also absolutely position the items.
 */
Ext.define('Ext.layout.container.Fit', {

    /* Begin Definitions */
    extend: 'Ext.layout.container.Container',
    alternateClassName: 'Ext.layout.FitLayout',

    alias: 'layout.fit',

    /* End Definitions */

    itemCls: Ext.baseCSSPrefix + 'fit-item',
    targetCls: Ext.baseCSSPrefix + 'layout-fit',
    type: 'fit',
   
    /**
     * @cfg {Object} defaultMargins
     * <p>If the individual contained items do not have a <tt>margins</tt>
     * property specified or margin specified via CSS, the default margins from this property will be
     * applied to each item.</p>
     * <br><p>This property may be specified as an object containing margins
     * to apply in the format:</p><pre><code>
{
    top: (top margin),
    right: (right margin),
    bottom: (bottom margin),
    left: (left margin)
}</code></pre>
     * <p>This property may also be specified as a string containing
     * space-separated, numeric margin values. The order of the sides associated
     * with each value matches the way CSS processes margin values:</p>
     * <div class="mdetail-params"><ul>
     * <li>If there is only one value, it applies to all sides.</li>
     * <li>If there are two values, the top and bottom borders are set to the
     * first value and the right and left are set to the second.</li>
     * <li>If there are three values, the top is set to the first value, the left
     * and right are set to the second, and the bottom is set to the third.</li>
     * <li>If there are four values, they apply to the top, right, bottom, and
     * left, respectively.</li>
     * </ul></div>
     * <p>Defaults to:</p><pre><code>
     * {top:0, right:0, bottom:0, left:0}
     * </code></pre>
     */
    defaultMargins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },

    manageMargins: true,

    // layout only controls dimensions which IT has controlled.
    // That calculation has to be determined at run time by examining the ownerCt's isFixedWidth()/isFixedHeight() methods
    sizePolicy: {
        setsWidth: -1,
        setsHeight: -1
    },

    getItemSizePolicy: function (item) {
        return this.sizePolicy;
    },

    // @private
    calculate : function(ownerContext) {
        var me = this,
            childItems = ownerContext.childItems,
            length = childItems.length,
            targetSize = me.getContainerSize(ownerContext),
            contentSize = { width: 0, height: 0 },
            i;

        for (i = 0; i < length; ++i) {
            me.fitItem(ownerContext, childItems[i], targetSize, contentSize);
        }

        if (!ownerContext.setContentSize(contentSize.width, contentSize.height)) {
            me.done = false;
        }
    },

    fitItem: function(ownerContext, itemContext, targetSize, contentSize) {
        var me = this,
            margins = itemContext.getMarginInfo(),
            needed = 0,
            got = 0;

        // Attempt to set only dimensions that are being controlled, not autosized dimensions
        if (ownerContext.autoWidth) {
            contentSize.width = Math.max(contentSize.width, itemContext.getProp('width'));
        } else {
            needed = 1;
            if (targetSize.gotWidth) {
                got = 1;
                itemContext.setWidth(targetSize.width - margins.width);
            }
        }

        if (ownerContext.autoHeight) {
            contentSize.height = Math.max(contentSize.height, itemContext.getProp('height'));
        } else {
            ++needed;
            if (targetSize.gotHeight) {
                ++got;
                itemContext.setHeight(targetSize.height - margins.height);
            }
        }

        // Adjust position to account for configured margins
        if (margins.left || margins.top) {
            itemContext.setProp('x', margins.left);
            itemContext.setProp('y', margins.top);
        }

        // If not all required dimensions have been satisfied, we're not done.
        if (got != needed) {
            me.done = false;
        }
    }
});
