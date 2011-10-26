/**
 * @class Ext.layout.container.Box
 * <p>Base Class for HBoxLayout and VBoxLayout Classes. Generally it should not need to be used directly.</p>
 */

Ext.define('Ext.layout.container.Box', {

    /* Begin Definitions */

    alias: ['layout.box'],
    extend: 'Ext.layout.container.Container',
    alternateClassName: 'Ext.layout.BoxLayout',

    requires: [
        'Ext.layout.container.boxOverflow.None',
        'Ext.layout.container.boxOverflow.Menu',
        'Ext.layout.container.boxOverflow.Scroller',
        'Ext.util.Format',
        'Ext.dd.DragDropManager'
    ],

    /* End Definitions */

    isBox: true,

    /**
     * @cfg {Boolean/Number/Object} animate
     * <p>If truthy, child Component are <i>animated</i> into position whenever the Container
     * is layed out. If this option is numeric, it is used as the animation duration in milliseconds.</p>
     * <p>May be set as a property at any time.</p>
     */

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
     */
    defaultMargins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },

    /**
     * @cfg {String} padding
     * <p>Sets the padding to be applied to all child items managed by this layout.</p>
     * <p>This property must be specified as a string containing
     * space-separated, numeric padding values. The order of the sides associated
     * with each value matches the way CSS processes padding values:</p>
     * <div class="mdetail-params"><ul>
     * <li>If there is only one value, it applies to all sides.</li>
     * <li>If there are two values, the top and bottom borders are set to the
     * first value and the right and left are set to the second.</li>
     * <li>If there are three values, the top is set to the first value, the left
     * and right are set to the second, and the bottom is set to the third.</li>
     * <li>If there are four values, they apply to the top, right, bottom, and
     * left, respectively.</li>
     * </ul></div>
     */
    padding: 0,

    // documented in subclasses
    pack: 'start',

    /**
     * @cfg {String} pack
     * Controls how the child items of the container are packed together. Acceptable configuration values
     * for this property are:
     * <div class="mdetail-params"><ul>
     * <li><b><tt>start</tt></b> : <b>Default</b><div class="sub-desc">child items are packed together at
     * <b>left</b> side of container</div></li>
     * <li><b><tt>center</tt></b> : <div class="sub-desc">child items are packed together at
     * <b>mid-width</b> of container</div></li>
     * <li><b><tt>end</tt></b> : <div class="sub-desc">child items are packed together at <b>right</b>
     * side of container</div></li>
     * </ul></div>
     */
    /**
     * @cfg {Number} flex
     * This configuration option is to be applied to <b>child <tt>items</tt></b> of the container managed
     * by this layout. Each child item with a <tt>flex</tt> property will be flexed <b>horizontally</b>
     * according to each item's <b>relative</b> <tt>flex</tt> value compared to the sum of all items with
     * a <tt>flex</tt> value specified.  Any child items that have either a <tt>flex = 0</tt> or
     * <tt>flex = undefined</tt> will not be 'flexed' (the initial size will not be changed).
     */

    type: 'box',
    scrollOffset: 0,
    itemCls: Ext.baseCSSPrefix + 'box-item',
    targetCls: Ext.baseCSSPrefix + 'box-layout-ct',
    innerCls: Ext.baseCSSPrefix + 'box-inner',

    // availableSpaceOffset is used to adjust the availableWidth, typically used
    // to reserve space for a scrollbar
    availableSpaceOffset: 0,

    // whether or not to reserve the availableSpaceOffset in layout calculations
    reserveOffset: true,

    manageMargins: true,

    childEls: [
        'innerCt'
    ],

    renderTpl: [
        '{%this.renderOverflowPrefix(out, values)%}',
        '<div id="{ownerId}-innerCt" class="{[values.$layout.innerCls]} {[values.$layout.overflowHandler.getOverflowCls()]}" role="presentation">',
            '{%this.renderBody(out, values)%}',
        '</div>',
        '{%this.renderOverflowSuffix(out, values)%}',
        {
            // Output the "before" scroller's markup into the output stream
            renderOverflowPrefix: function(out, values) {
                var overflowPrefixConfig = values.$comp.layout.overflowHandler.getPrefixConfig();

                if (overflowPrefixConfig) {
                    Ext.DomHelper.generateMarkup(overflowPrefixConfig, out);
                }
            },

            // Output the "after" scroller's markup into the output stream
            renderOverflowSuffix: function(out, values) {
                var overflowSuffixConfig = values.$comp.layout.overflowHandler.getSuffixConfig();

                if (overflowSuffixConfig) {
                    Ext.DomHelper.generateMarkup(overflowSuffixConfig, out);
                }
            },
            disableFormats: true
        }
    ],

    constructor: function(config) {
        var me = this,
            type;

        me.callParent(arguments);

        // The sort function needs access to properties in this, so must be bound.
        me.flexSortFn = Ext.Function.bind(me.flexSort, me);

        me.initOverflowHandler();

        type = typeof me.padding;
        if (type == 'string' || type == 'number') {
            me.padding = Ext.util.Format.parseBox(me.padding);
            me.padding.height = me.padding.top  + me.padding.bottom;
            me.padding.width  = me.padding.left + me.padding.right;
        }
    },

    getNames: function () {
        return this.names;
    },

    getItemSizePolicy: function (item) {
        var policy = this.sizePolicy,
            align = this.align,
            key = (align == 'stretchmax' || align == 'stretch') ? align : '';

        if (item.flex) {
            policy = policy.flex;
        }

        return policy[key];
    },

    flexSort: function (a, b) {
        var maxWidthName = 'max' + this.getNames().widthCap,
            infiniteValue = Infinity;

        a = a.target[maxWidthName] || infiniteValue;
        b = b.target[maxWidthName] || infiniteValue;

        // IE 6/7 Don't like Infinity - Infinity...
        if (!isFinite(a) && !isFinite(b)) {
            return 0;
        }

        return a - b;
    },

    isItemBoxParent: function (itemContext) {
        return true;
    },

    // Sort into *descending* order.
    minSizeSortFn: function(a, b) {
        return b.available - a.available;
    },

    roundFlex: function(width) {
        return Math.ceil(width);
    },

    /**
     * @private
     * Called by an owning Panel before the Panel begins its collapse process.
     * Most layouts will not need to override the default Ext.emptyFn implementation.
     */
    beginCollapse: function(child) {
        var me = this;

        if (me.direction === 'vertical' && child.collapsedVertical()) {
            child.collapseMemento.capture(['flex']);
            delete child.flex;
        } else if (me.direction === 'horizontal' && child.collapsedHorizontal()) {
            child.collapseMemento.capture(['flex']);
            delete child.flex;
        }
    },

    /**
     * @private
     * Called by an owning Panel before the Panel begins its expand process.
     * Most layouts will not need to override the default Ext.emptyFn implementation.
     */
    beginExpand: function(child) {

        // Restore's the flex if we used to be flexed before
        child.collapseMemento.restore(['flex']);
    },

    beginLayout: function (ownerContext) {
        var me = this;

        // this must happen before callParent to allow the overflow handler to do its work
        // that can effect the childItems collection...
        me.overflowHandler.beginLayout(ownerContext);

        me.callParent(arguments);

        ownerContext.innerCtContext = ownerContext.getEl('innerCt', me);

        me.cacheFlexes(ownerContext);
    },

    beginLayoutCycle: function (ownerContext, firstCycle) {
        var me = this,
            align = me.align,
            names = me.getNames(),
            pack = me.pack,
            autoHeightName = 'auto' + names.heightCap,
            authorityName, childItems, child, i, length;

        // this must happen before callParent to allow the overflow handler to do its work
        // that can effect the childItems collection...
        me.overflowHandler.beginLayoutCycle(ownerContext, firstCycle);

        me.callParent(arguments);

        // Cache several of our string concat/compare results (since autoWidth/Height can
        // change if we are invalidated, we cannot do this in beginLayout)

        ownerContext.isAutoParallel      = ownerContext['auto' + names.widthCap];
        ownerContext.isAutoPerpendicular = ownerContext[autoHeightName];

        ownerContext.boxOptions = {
            align: align = {
                stretch:    align == 'stretch',
                stretchmax: align == 'stretchmax',
                center:     align == names.center
            },
            pack: pack = {
                center: pack == 'center',
                end:    pack == 'end'
            }
        };

        // Consider an hbox w/stretch which means "assign all items the container's height".
        // The spirit of this request is make all items the same height, but when autoHeight
        // is also requested, the height of the tallest item determines the height. This is
        // exactly what the stretchmax option does, so we jiggle the flags here to act as
        // if stretchmax were requested.

        if (align.stretch && ownerContext.isAutoPerpendicular) {
            align.stretchmax = true;
            align.stretch = false;
        }

        // In our example hbox, packing items to the right (end) or center can only work if
        // there is a container width. So, if we are autoWidth, we just turn off the pack
        // options for the run.

        if (ownerContext.isAutoParallel) {
            pack.center = pack.end = false;
        }

        // StretchMax
        // ==========
        // This fellow is more interesting than just about any other layout. Consider an
        // hbox w/stretchmax. The idea is to first first allow the children to perform their
        // natural (autoHeight) layout and then to set the height of all children to the
        // the maximum height of any child. In terms of layout, this equates to starting
        // with all children as autoHeight (heightAuthority=0) or fixed (heightAuthority=1).
        // Then down in calculateStretcMax we flip the autoHeight children to layout-sized
        // (heightAuthority=2) and set their height to the maxHeight. If we ever have to
        // start over due to invalidate, we must restart back at the beginning (which is
        // why this logic is not in beginLayout).

        if (align.stretchmax) {
            authorityName = names.height + 'Authority';
            childItems = ownerContext.childItems;
            length = childItems.length;

            for (i = 0; i < length; ++i) {
                child = childItems[i];
                if (child[authorityName] != 1) { // if (not a configured height)
                    child[authorityName] = 0;
                    child[autoHeightName] = true;
                }
            }
        }
    },

    /**
     * This method is called to (re)cache our understanding of flexes. This happens during
     * beginLayout and may need to be called again if the flexes are changed during the
     * layout (e.g., like ColumnLayout).
     * @protected
     */
    cacheFlexes: function (ownerContext) {
        var names = this.getNames(),
            authority = names.width + 'Authority',
            totalFlex = 0,
            childItems = ownerContext.childItems,
            i = childItems.length,
            flexedItems = [],
            minWidth = 0,
            minWidthName = 'min' + names.widthCap,
            child, childContext, flex;

        while (i--) {
            childContext = childItems[i];

            // if the child has a flex it could be "accidental" (typically via "defaults"),
            // so just check widthAuthority to see if we are the sizing layout. If so, copy
            // the flex from the item to the contextItem and add it to totalFlex
            //
            if (childContext[authority] == 2) { // if (sized by this layout)
                child = childContext.target;
                childContext.flex = flex = child.flex;
                if (flex) {
                    totalFlex += flex;
                    flexedItems.push(childContext);
                    minWidth += child[minWidthName] || 0;
                }
            }
            // the above means that "childContext.flex" is properly truthy/falsey, which is
            // often times quite convenient...
        }

        ownerContext.flexedItems = flexedItems;
        ownerContext.flexedMinSize = minWidth;
        ownerContext.totalFlex = totalFlex;

        // The flexed boxes need to be sorted in ascending order of maxSize to work properly
        // so that unallocated space caused by maxWidth being less than flexed width can be
        // reallocated to subsequent flexed boxes.
        Ext.Array.sort(flexedItems, this.flexSortFn);
    },

    calculate: function(ownerContext) {
        var me = this,
            targetSize = me.getContainerSize(ownerContext),
            names = me.getNames(),
            widthName = names.width,
            state = ownerContext.state,
            plan = state.boxPlan || (state.boxPlan = {});

        if (ownerContext.isAutoParallel) {
            //<debug>
            if (ownerContext.totalFlex) {
                Ext.Error.raise('Cannot combine flex and auto '+widthName+' in '+me.type);
            }
            //</debug>
        } else if (!targetSize['got' + names.widthCap]) {
            // If we are autoWidth, we cannot have any flex. Otherwise, we need the parallel
            // measurement before we can lay out boxes:
            //ownerContext.block(me, widthName);
            me.done = false;
            return;
        }

        plan.targetSize = targetSize;

        if (!state.parallelDone) {
            state.parallelDone = me.calculateParallel(ownerContext, names, plan);
        }

        // Fix for left and right docked Components in a dock component layout. This is for docked Headers and docked Toolbars.
        // Older Microsoft browsers do not size a position:absolute element's width to match its content.
        // So in this case, in the publishInnerCtSize method we may need to adjust the size of the owning Container's element explicitly based upon
        // the discovered max width. So here we put a calculatedWidth property in the metadata to facilitate this.
//        if (me.owner.dock && (Ext.isIE6 || Ext.isIE7 || Ext.isIEQuirks) && !me.owner.width && !me.horizontal) {
//            plan.isIEVerticalDock = true;
//            plan.calculatedWidth = plan.maxSize + ownerContext.getPaddingInfo().width + ownerContext.getFramingInfo().width;
//
//            // If the owning element is not sized, calculate the available width to center or stretch in based upon maxSize
//            availHeight = Math.min(availHeight, targetSize.width = maxHeight + padding.left + padding.right);
//        }

        if (!state.perpendicularDone) {
            state.perpendicularDone = me.calculatePerpendicular(ownerContext, names, plan);
        }

        if (!state.parallelDone || !state.perpendicularDone) {
            me.done = false;
        } else {
            me.publishInnerCtSize(ownerContext, me.reserveOffset ? me.availableSpaceOffset : 0);

            if (me.done && ownerContext.boxOptions.align.stretchmax && !state.stretchMaxDone) {
                me.calculateStretchMax(ownerContext, names, plan);
                state.stretchMaxDone = true;
            }
        }
    },

    calculateParallel: function(ownerContext, names, plan) {
        var me = this,
            widthName = names.width,
            widthNameCap = names.widthCap,
            childItems = ownerContext.childItems,
            leftName = names.left,
            rightName = names.right,
            setWidthName = 'set' + widthNameCap,
            childItemsLength = childItems.length,
            flexedItems = ownerContext.flexedItems,
            flexedItemsLength = flexedItems.length,
            pack = ownerContext.boxOptions.pack,
            padding = me.padding,
            left = padding[leftName],
            nonFlexWidth = left + padding[rightName] + me.scrollOffset +
                                    (me.reserveOffset ? me.availableSpaceOffset : 0),
            i, childMargins, remainingWidth, remainingFlex, childContext, flex, flexedWidth,
            contentWidth;

        // Gather the total size taken up by auto/fixed items (non-flexed items),
        for (i = 0; i < childItemsLength; ++i) {
            childContext = childItems[i];
            childMargins = childContext.marginInfo || childContext.getMarginInfo();

            nonFlexWidth += childMargins[widthName];

            if (!childContext.flex) {
                nonFlexWidth += childContext.getProp(widthName); // min/maxWidth safe
                if (isNaN(nonFlexWidth)) {
                    return false;
                }
            }
        }
        // if we get here, we have all the childWidths for non-flexed items...

        if (ownerContext.isAutoParallel) {
            plan.availableSpace = nonFlexWidth;
            plan.tooNarrow = false;
        } else {
            plan.availableSpace = plan.targetSize[widthName] - nonFlexWidth;
            plan.tooNarrow = plan.availableSpace < ownerContext.flexedMinSize;
        }

        contentWidth = nonFlexWidth;
        remainingWidth = plan.availableSpace;
        remainingFlex = ownerContext.totalFlex;

        // Calculate flexed item sizes:
        for (i = 0; i < flexedItemsLength; i++) {
            childContext = flexedItems[i];
            flex         = childContext.flex;
            flexedWidth  = me.roundFlex((flex / remainingFlex) * remainingWidth);
            flexedWidth  = childContext[setWidthName](flexedWidth); // constrained

            contentWidth   += flexedWidth;
            // Remaining space has already had margins subtracted, so just subtract size
            remainingWidth -= flexedWidth;
            remainingFlex  -= flex;
        }

        if (pack.center) {
            left += remainingWidth / 2;
        } else if (pack.end) {
            left += remainingWidth;
        }

        ownerContext['setContent' + widthNameCap](contentWidth + me.padding[widthName] + ownerContext.targetContext.getPaddingInfo()[widthName]);

        // Assign parallel position for the boxes:
        for (i = 0; i < childItemsLength; ++i) {
            childContext = childItems[i];
            childMargins = childContext.marginInfo; // already cached by first loop

            left += childMargins[leftName];

            childContext.setProp(names.x, left);

            // We can read directly from "props.width" because we have already properly
            // requested it in the calculation of nonFlexedWidths or we calculated it.
            // We cannot call getProp because that would be inappropriate for flexed items
            // and we don't need any extra function call overhead:
            left += childMargins[rightName] + childContext.props[widthName];
        }

        return true;
    },

    calculatePerpendicular: function(ownerContext, names, plan) {
        var me = this,
            autoHeight = ownerContext.isAutoPerpendicular,
            targetSize = plan.targetSize,
            childItems = ownerContext.childItems,
            childItemsLength = childItems.length,
            mmax = Math.max,
            heightName = names.height,
            heightNameCap = names.heightCap,
            setHeightName = 'set' + heightNameCap,
            topName = names.top,
            topPositionName = names.y,
            padding = me.padding,
            top = padding[topName],
            availHeight = targetSize[heightName] - top - padding[names.bottom],
            align = ownerContext.boxOptions.align,
            isStretch    = align.stretch, // never true if autoHeight (see beginLayoutCycle)
            isStretchMax = align.stretchmax,
            isCenter     = align.center,
            maxHeight = 0,
            childTop, i, childHeight, childMargins, diff, height, childContext;

        if (isStretch || (isCenter && !autoHeight)) {
            if (isNaN(availHeight)) {
                return false;
            }
        }

        if (isStretch) {
            height = availHeight; // never autoHeight...
        } else {
            for (i = 0; i < childItemsLength; i++) {
                childContext = childItems[i];
                childMargins = childContext.marginInfo || childContext.getMarginInfo();
                childHeight  = childContext.getProp(heightName);

                // Max perpendicular measurement (used for stretchmax) must take the min perpendicular size of each child into account in case any fall short.
                if (isNaN(maxHeight = mmax(maxHeight, childHeight + childMargins[heightName], childContext.target['min' + heightNameCap]||0))) {
                    return false; // autoHeight || isCenter || isStretchMax ??
                }
            }

            plan.maxSize = maxHeight;
            ownerContext['setContent' + heightNameCap](maxHeight + me.padding[heightName] + ownerContext.targetContext.getPaddingInfo()[heightName]);

            if (isStretchMax) {
                height = maxHeight;
            } else if (isCenter) {
                height = autoHeight ? maxHeight : mmax(availHeight, maxHeight);

                // When calculating a centered position within the content box of the innerCt,
                // the width of the borders must be subtracted from the size to yield the
                // space available to center within. The publishInnerCtSize method explicitly
                // adds the border widths to the set size of the innerCt.
                height -= ownerContext.innerCtContext.getBorderInfo()[heightName];
            }
        }

        for (i = 0; i < childItemsLength; i++) {
            childContext = childItems[i];
            childMargins = childContext.marginInfo || childContext.getMarginInfo();

            childTop = top + childMargins[topName];

            if (isStretch) {
                childContext[setHeightName](height - childMargins[heightName]);
            } else if (isCenter) {
                diff = height - childContext.props[heightName];
                if (diff > 0) {
                    childTop = top + Math.round(diff / 2);
                }
            }

            childContext.setProp(topPositionName, childTop);
        }

        return true;
    },

    calculateStretchMax: function (ownerContext, names, plan) {
        var heightAuthorityName = names.height + 'Authority',
            autoHeightName = 'auto' + names.heightCap,
            heightName = names.height,
            widthName = names.width,
            childItems = ownerContext.childItems,
            length = childItems.length,
            height = plan.maxSize,
            onInvalidateChild = this.onInvalidateChild,
            childContext, props, i;

        for (i = 0; i < length; ++i) {
            childContext = childItems[i];

            if (childContext[autoHeightName]) { // if (not a configured height)
                props = childContext.props;

                if (props[heightName] != height) { // if (wrong height)
                    // Change the childItem from autoHeight to "set by ownerCt". To allow
                    // the child's component layout to course-correct (like dock layout
                    // does for a collapsed panel), we must make these changes here before
                    // invalidating the child:
                    childContext[heightAuthorityName] = 2;
                    childContext[autoHeightName] = false;

                    // When we invalidate a child, since we won't be around to size and
                    // position it, we include a callback that will be run following the
                    // invalidate that will (re)do that work. The good news here is that
                    // we can read the results of all that from the childContext props.
                    childContext.invalidate({
                        callback: onInvalidateChild,
                        layout: this,
                        // passing this data avoids a 'scope' and its Function.bind
                        childWidth: props[widthName],
                        childHeight: height,
                        childX: props.x,
                        childY: props.y,
                        names: names
                    });
                }
            }
        }
    },

    completeLayout: function(ownerContext) {
        this.overflowHandler.completeLayout(ownerContext);
    },

    onInvalidateChild: function (options, childContext) {
        // NOTE: No "this" pointer in here...
        var names = options.names,
            heightCapName = names.heightCap;

        childContext.setProp('x', options.childX);
        childContext.setProp('y', options.childY);

        if (!childContext['auto' + heightCapName]) {
            // We need to respect a child that is still autoHeight (such as a collapsed
            // panel)...
            childContext['set' + heightCapName](options.childHeight);
        }

        if (childContext.flex) {
            childContext['set' + names.widthCap](options.childWidth);
        }
    },

    publishInnerCtSize: function(ownerContext, reservedSpace) {
        var me = this,
            autoHeight = ownerContext.isAutoPerpendicular,
            names = me.getNames(),
            heightName = names.height,
            widthName = names.width,
            align = ownerContext.boxOptions.align,
            dock = me.owner.dock,
            padding = me.padding,
            plan = ownerContext.state.boxPlan,
            targetSize = plan.targetSize,
            height = targetSize[heightName],
            innerCtContext = ownerContext.innerCtContext,
            innerCtWidth = (ownerContext.isAutoParallel
                    ? ownerContext.props['content' + names.widthCap]
                    : targetSize[widthName]) - (reservedSpace || 0),
            innerCtHeight;

        if (align.stretch) {
            innerCtHeight = height;
        } else {
            innerCtHeight = plan.maxSize + padding[names.top] + padding[names.bottom] +
                                    innerCtContext.getBorderInfo()[heightName];

            if (!autoHeight && align.center) {
                innerCtHeight = Math.max(height, innerCtHeight);
            }
        }

        innerCtContext['set' + names.widthCap](innerCtWidth);
        innerCtContext['set' + names.heightCap](innerCtHeight);

        // If unable to publish both dimensions, this layout needs to run again
        if (isNaN(innerCtWidth + innerCtHeight)) {
            me.done = false;
        }

        // If a calculated width has been found (and this only happens for auto-width vertical
        // docked Components in old Microsoft browsers) then, if the Component has not assumed
        // the size of its content, set it to do so.
        if (plan.calculatedWidth && (dock == 'left' || dock == 'right')) {
            ownerContext.setWidth(plan.calculatedWidth);
        }
    },

    onRemove: function(comp){
        var me = this;
        me.callParent(arguments);
        if (me.overflowHandler) {
            me.overflowHandler.onRemove(comp);
        }
        if (comp.layoutMarginCap == me.id) {
            delete comp.layoutMarginCap;
        }
    },

    /**
     * @private
     */
    initOverflowHandler: function() {
        var me = this,
            handler = me.overflowHandler,
            handlerType,
            constructor;

        if (typeof handler == 'string') {
            handler = {
                type: handler
            };
        }

        handlerType = 'None';
        if (handler && handler.type !== undefined) {
            handlerType = handler.type;
        }

        constructor = Ext.layout.container.boxOverflow[handlerType];
        if (constructor[me.type]) {
            constructor = constructor[me.type];
        }

        me.overflowHandler = Ext.create('Ext.layout.container.boxOverflow.' + handlerType, me, handler);
    },

    /**
     * @private
     * This should be called after onLayout of any BoxLayout subclass. If the target's overflow is not set to 'hidden',
     * we need to lay out a second time because the scrollbars may have modified the height and width of the layout
     * target. Having a Box layout inside such a target is therefore not recommended.
     * @param {Object} previousTargetSize The size and height of the layout target before we just laid out
     * @param {Ext.container.Container} container The container
     * @param {Ext.Element} target The target element
     * @return True if the layout overflowed, and was reflowed in a secondary onLayout call.
     */
    handleTargetOverflow: function(previousTargetSize) {
        var me = this,
            target = me.getTarget(),
            overflow = target.getStyle('overflow'),
            newTargetSize;

        if (overflow && overflow != 'hidden' && !me.adjustmentPass) {
            newTargetSize = me.getLayoutTargetSize();
            if (newTargetSize.width != previousTargetSize.width || newTargetSize.height != previousTargetSize.height) {
                me.adjustmentPass = true;
                me.onLayout();
                return true;
            }
        }

        delete me.adjustmentPass;
    },

    // private
    isValidParent : function(item, target, position) {
        // Note: Box layouts do not care about order within the innerCt element because it's an absolutely positioning layout
        // We only care whether the item is a direct child of the innerCt element.
        var itemEl = item.el ? item.el.dom : Ext.getDom(item);
        return (itemEl && this.innerCt && itemEl.parentNode === this.innerCt.dom) || false;
    },

    getItemFlexDimension: function () {
        var names = this.getNames();
        return names.height;
    },

    // Overridden method from AbstractContainer.
    // Used in the base AbstractLayout.beforeLayout method to render all items into.
    getRenderTarget: function() {
        return this.innerCt;
    },

    /**
     * @private
     */
    destroy: function() {
        Ext.destroy(this.innerCt, this.overflowHandler);
        this.callParent(arguments);
    }
});
