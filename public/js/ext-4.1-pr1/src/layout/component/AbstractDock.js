/**
 * @class Ext.layout.component.AbstractDock
 * @extends Ext.layout.component.Component
 * @private
 * This ComponentLayout handles docking for Panels. It takes care of panels that are
 * part of a ContainerLayout that sets this Panel's size and Panels that are part of
 * an AutoContainerLayout in which this panel get his height based of the CSS or
 * or its content.
 */

Ext.define('Ext.layout.component.AbstractDock', {

    /* Begin Definitions */

    extend: 'Ext.layout.component.Component',

    /* End Definitions */

    type: 'dock',

    /**
     * @private
     * @property autoSizing
     * @type Boolean
     * This flag is set to indicate this layout may have an autoHeight/autoWidth.
     */
    autoSizing: true,
    
    horizontalCollapsePolicy: { width: true },
    verticalCollapsePolicy: { height: true },

    finishRender: function () {
        var me = this,
            target, items;

        me.callParent();

        target = me.getRenderTarget();
        items = me.getDockedItems();

        me.finishRenderItems(target, items);
    },

    isItemBoxParent: function (itemContext) {
        return true;
    },

    handleItemBorders: function() {
        var me = this,
            owner = me.owner,
            docked = me.getLayoutItems(),
            borders = {
                top: [],
                right: [],
                bottom: [],
                left: []
            },
            oldBorders = me.borders,
            opposites = {
                top: 'bottom',
                right: 'left',
                bottom: 'top',
                left: 'right'
            },
            i, ln, item, dock, side;

        for (i = 0, ln = docked.length; i < ln; i++) {
            item = docked[i];
            dock = item.dock;

            if (item.ignoreBorderManagement) {
                continue;
            }

            if (!borders[dock].satisfied) {
                borders[dock].push(item);
                borders[dock].satisfied = true;
            }

            if (!borders.top.satisfied && opposites[dock] !== 'top') {
                borders.top.push(item);
            }
            if (!borders.right.satisfied && opposites[dock] !== 'right') {
                borders.right.push(item);
            }
            if (!borders.bottom.satisfied && opposites[dock] !== 'bottom') {
                borders.bottom.push(item);
            }
            if (!borders.left.satisfied && opposites[dock] !== 'left') {
                borders.left.push(item);
            }
        }

        if (oldBorders) {
            for (side in oldBorders) {
                if (oldBorders.hasOwnProperty(side)) {
                    ln = oldBorders[side].length;
                    if (!owner.manageBodyBorders) {
                        for (i = 0; i < ln; i++) {
                            oldBorders[side][i].removeCls(Ext.baseCSSPrefix + 'docked-noborder-' + side);
                        }
                        if (!oldBorders[side].satisfied && !owner.bodyBorder) {
                            owner.removeBodyCls(Ext.baseCSSPrefix + 'docked-noborder-' + side);
                        }
                    }
                    else if (oldBorders[side].satisfied) {
                        owner.setBodyStyle('border-' + side + '-width', '');
                    }
                }
            }
        }

        for (side in borders) {
            if (borders.hasOwnProperty(side)) {
                ln = borders[side].length;
                if (!owner.manageBodyBorders) {
                    for (i = 0; i < ln; i++) {
                        borders[side][i].addCls(Ext.baseCSSPrefix + 'docked-noborder-' + side);
                    }
                    if ((!borders[side].satisfied && !owner.bodyBorder) || owner.bodyBorder === false) {
                        owner.addBodyCls(Ext.baseCSSPrefix + 'docked-noborder-' + side);
                    }
                }
                else if (borders[side].satisfied) {
                    owner.setBodyStyle('border-' + side + '-width', '1px');
                }
            }
        }

        me.borders = borders;
    },

    beginLayout: function(ownerContext) {
        var me = this,
            owner = me.owner,
            docked = me.getLayoutItems(),
            layoutContext = ownerContext.context,
            len = docked.length,
            collapsedVert = false,
            collapsedHorz = false,
            dockedItems, i, item, itemContext, offsets,
            collapsed;

        me.callParent(arguments);

        // Correct border settings so that the Oabek appears to conform to border configs.
        if ((!me.initializedBorders || me.childrenChanged) && (!me.owner.border || me.owner.manageBodyBorders)) {
            me.handleItemBorders();
            me.initializedBorders = true;
        }

        // Cache the children as ContextItems (like a Container). Also setup to handle
        // collapsed state:
        collapsed = me.owner.getCollapsed();
        if (Ext.isDefined(me.lastCollapsedState) && (collapsed !== me.lastCollapsedState)) {

            // If we are collapsing...
            if (me.owner.collapsed) {
                ownerContext.isCollapsingOrExpanding = 1;
                // Add the collapsed class now, so that collapsed CSS rules are applied before measurements are taken by the layout.
                owner.addClsWithUI(owner.collapsedCls);
            } else {
                ownerContext.isCollapsingOrExpanding = 2;
                // Remove the collapsed class now, before layout calculations are done.
                owner.removeClsWithUI(owner.collapsedCls);
                ownerContext.lastCollapsedState = me.lastCollapsedState;
            } 
        }
        me.lastCollapsedState = collapsed;

        ownerContext.dockedItems = dockedItems = [];

        for (i = 0; i < len; i++) {
            item = docked[i];

            itemContext = layoutContext.getCmp(item);
            itemContext.dockedAt = { x: 0, y: 0 };
            itemContext.offsets = offsets = Ext.Element.parseBox(item.offsets || {});
            offsets.width = offsets.left + offsets.right;
            offsets.height = offsets.top + offsets.bottom;

            dockedItems.push(itemContext);
        }

        if (owner.collapsed) {
            if (owner.collapsedVertical()) {
                collapsedVert = true;
                ownerContext.measureDimensions = 1;
            } else {
                collapsedHorz = true;
                ownerContext.measureDimensions = 2;
            }
        }

        ownerContext.collapsedVert = collapsedVert;
        ownerContext.collapsedHorz = collapsedHorz;

        ownerContext.bodyContext = ownerContext.getEl('body');
    },

    beginLayoutCycle: function(ownerContext) {
        var me = this,
            docked = ownerContext.dockedItems,
            len = docked.length,
            owner = me.owner,
            i, item, dock;

        me.callParent(arguments);

        // If we are collapsed, we want to auto-layout using the placeholder/expander
        // instead of the normal items/dockedItems. This must be done here since we could
        // be in a box layout w/stretchmax which sets the width/heightAuthority and the
        // autoWidth/Height flags to allow it to control the size.
        if (ownerContext.collapsedVert) {
            ownerContext.autoHeight = true;
            ownerContext.heightAuthority = 0;
        } else if (ownerContext.collapsedHorz) {
            ownerContext.autoWidth = true;
            ownerContext.widthAuthority = 0;
        }

        //owner.getTargetEl().setSize(null, null);
        if (ownerContext.autoWidth) {
            owner.body.setWidth(null);
            owner.el.setWidth(null);
        }
        if (ownerContext.autoHeight) {
            owner.body.setHeight(null);
            owner.el.setHeight(null);
        }

        // Each time we begin (2nd+ would be due to invalidate) we need to publish the
        // known contentWidth/Height if we are collapsed:
        if (ownerContext.collapsedVert) {
            ownerContext.setContentHeight(0);
        } else if (ownerContext.collapsedHorz) {
            ownerContext.setContentWidth(0);
        }

        // dock: 'right' items, when a panel gets narrower get "squished". Moving them to
        // left:0px avoids this!
        for (i = 0; i < len; i++) {
            item = docked[i].target;
            dock = item.dock;

            if (dock == 'right') {
                item.el.setLeft(0);
            } else if (dock != 'left') {
                continue;
            }

            // TODO - clear width/height?
        }
    },

    getAnimatePolicy: function(ownerContext) {
        var me = this,
            lastCollapsedState;

        if (ownerContext.isCollapsingOrExpanding == 1) {
            lastCollapsedState = me.lastCollapsedState;
        } else if (ownerContext.isCollapsingOrExpanding == 2) {
            lastCollapsedState = ownerContext.lastCollapsedState;
        } else {
            return;
        }

        if (lastCollapsedState === 'left' || lastCollapsedState == 'right') {
            return me.horizontalCollapsePolicy;
        } else if (lastCollapsedState === 'top' || lastCollapsedState == 'bottom') {
            return me.verticalCollapsePolicy;
        }
    },

    calculate: function (ownerContext) {
        var me = this,
            measure = me.measureAutoDimensions(ownerContext, ownerContext.measureDimensions),
            state = ownerContext.state,
            horzDone = state.horzDone,
            vertDone = state.vertDone,
            bodyContext = ownerContext.bodyContext,
            horz, vert, forward, backward;

        // make sure we can use these value w/o calling methods to get them
        ownerContext.borderInfo  || ownerContext.getBorderInfo();
        ownerContext.paddingInfo || ownerContext.getPaddingInfo();
        ownerContext.framingInfo || ownerContext.getFraming();
        bodyContext.borderInfo   || bodyContext.getBorderInfo();
        bodyContext.paddingInfo  || bodyContext.getPaddingInfo();

        // Start the axes so they are ready to proceed inwards (fixed-size) or outwards
        // (auto-size) and stash key property names as well:
        horz = !horzDone &&
               me.createAxis(ownerContext, measure.contentWidth, ownerContext.autoWidth,
                             'left', 'right', 'x', 'width', 'Width', ownerContext.collapsedHorz);
        vert = !vertDone &&
               me.createAxis(ownerContext, measure.contentHeight, ownerContext.autoHeight,
                             'top', 'bottom', 'y', 'height', 'Height', ownerContext.collapsedVert);

        // We iterate forward and backward over the dockedItems at the same time based on
        // whether an axis is auto-size or fixed-size. For a fixed-size axis, the outer box
        // axis is allocated to docked items in forward order and is reduced accordingly.
        // To handle an auto-size axis, the box starts at the inner (body) size and is used to
        // size docked items in backwards order. This is because the last docked item shares
        // an edge with the body. The item size is used to adjust the auto-size axis outwards
        // until the first docked item (at the outermost edge) is processed. This backwards
        // order ensures that docked items never get an incorrect size for any dimension.
        for (forward = 0, backward = ownerContext.dockedItems.length; backward--; ++forward) {
            if (horz) {
                me.dockChild(ownerContext, horz, backward, forward);
            }
            if (vert) {
                me.dockChild(ownerContext, vert, backward, forward);
            }
        }

        if (horz && me.finishAxis(ownerContext, horz)) {
            state.horzDone = horzDone = horz;
        }
        if (vert && me.finishAxis(ownerContext, vert)) {
            state.vertDone = vertDone = vert;
        }

        // Once all items are docked, the final size of the outer panel or inner body can
        // be determined. If we can determine both width and height, we are done.
        if (horzDone && vertDone) {
            // Size information is published as we dock items but position is hard to do
            // that way (while avoiding published multiple times) so we publish all the
            // positions at the end.
            me.finishPositions(ownerContext, horzDone, vertDone);
        } else {
            me.done = false;
        }
    },

    /**
     * Creates an axis object given the particulars.
     */
    createAxis: function (ownerContext, contentSize, auto, dockBegin, dockEnd, posProp,
                          sizeProp, sizePropCap, collapsedAxis) {
        var border, bodyContext, frameSize, padding, begin = 0, end;

        if (auto) {
            // End position before adding docks around the content is content size plus the body borders in this axis.
            // If collapsed in this axis, the body borders will not be shown.
            if (collapsedAxis) {
                end = 0;
            } else {
                bodyContext = ownerContext.bodyContext;
                end = contentSize + bodyContext.borderInfo[sizeProp];
            }
        } else {
            border    = ownerContext.borderInfo;
            frameSize = ownerContext.framingInfo;
            padding   = ownerContext.paddingInfo;

            begin = border[dockBegin] + padding[dockBegin] + frameSize[dockBegin];
            end = ownerContext.getProp(sizeProp) - border[dockEnd] - padding[dockEnd] - frameSize[dockEnd];
        }

        return {
            auto: auto,
            // An axis tracks start and end+1 px positions. eg 0 to 10 for 10px high
            begin: begin,
            end: end,
            collapsed: collapsedAxis,
            horizontal: posProp == 'x',
            ignoreFrameBegin: false,
            ignoreFrameEnd: false,
            initialSize: end - begin,
            dockBegin: dockBegin,    // 'left' or 'top'
            dockEnd: dockEnd,        // 'right' or 'end'
            posProp: posProp,        // 'x' or 'y'
            sizeProp: sizeProp,      // 'width' or 'height'
            sizePropCap: sizePropCap, // 'Width' or 'Height'
            setSize: 'set' + sizePropCap
        };
    },

    /**
     * Docks a child item on the specified axis. This boils down to determining if the item
     * is docked at the "beginning" of the axis ("left" if horizontal, "top" if vertical),
     * the "end" of the axis ("right" if horizontal, "bottom" if vertical) or stretches
     * along the axis ("top" or "bottom" if horizontal, "left" or "right" if vertical). It
     * also has to differentiate between fixed and auto sized dimensions.
     */
    dockChild: function (ownerContext, axis, backward, forward) {
        var me = this,
            itemContext = ownerContext.dockedItems[axis.auto ? backward : forward],
            item = itemContext.target,
            dock = item.dock, // left/top/right/bottom
            pos;

        if (dock == axis.dockBegin) {
            if (axis.auto) {
                pos = me.dockOutwardBegin(ownerContext, itemContext, item, axis);
            } else {
                pos = me.dockInwardBegin(ownerContext, itemContext, item, axis);
            }
        } else if (dock == axis.dockEnd) {
            if (axis.auto) {
                pos = me.dockOutwardEnd(ownerContext, itemContext, item, axis);
            } else {
                pos = me.dockInwardEnd(ownerContext, itemContext, item, axis);
            }
        } else {
            pos = me.dockStretch(ownerContext, itemContext, item, axis);
        }

        itemContext.dockedAt[axis.posProp] = pos;
    },

    /**
     * Docks an item on a fixed-size axis at the "beginning". The "beginning" of the horizontal
     * axis is "left" and the vertical is "top". For a fixed-size axis, the size works from
     * the outer element (the panel) towards the body.
     * @private
     */
    dockInwardBegin: function (ownerContext, itemContext, item, axis) {
        var pos = axis.begin,
            sizeProp = axis.sizeProp,
            dock;

        if (item.ignoreParentFrame) {
            dock = item.dock;
            pos -= ownerContext.borderInfo[dock] + ownerContext.paddingInfo[dock] +
                   ownerContext.framingInfo[dock];
        }

        if (!item.overlay) {
            axis.begin += itemContext.getProp(sizeProp) + itemContext.getMarginInfo()[sizeProp];
        }

        return pos;
    },

    /**
     * Docks an item on a fixed-size axis at the "end". The "end" of the horizontal axis is
     * "right" and the vertical is "bottom".
     * @private
     */
    dockInwardEnd: function (ownerContext, itemContext, item, axis) {
        var sizeProp = axis.sizeProp,
            size = itemContext.getProp(sizeProp) + itemContext.getMarginInfo()[sizeProp],
            pos = axis.end - size;

        if (!item.overlay) {
            axis.end = pos;
        }

        if (item.ignoreParentFrame) {
            pos += ownerContext.borderInfo[item.dock] + ownerContext.paddingInfo[item.dock] +
                   ownerContext.framingInfo[item.dock];
        }

        return pos;
    },

    /**
     * Docks an item on an auto-size axis at the "beginning". The "beginning" of the horizontal
     * axis is "left" and the vertical is "top". For an auto-size axis, the size works from
     * the body outward to the outermost element (the panel).
     * 
     * During the docking process, coordinates are allowed to be negative. We start with the
     * body at (0,0) so items docked "top" or "left" will simply be assigned negative x/y. In
     * the {@link #finishPositions} method these are corrected and framing is added. This way
     * the correction is applied as a simple translation of delta x/y on all coordinates to
     * bring the origin back to (0,0).
     * @private
     */
    dockOutwardBegin: function (ownerContext, itemContext, item, axis) {
        var pos = axis.begin,
            sizeProp = axis.sizeProp,
            dock, size;

        if (axis.collapsed) {
            axis.ignoreFrameBegin = axis.ignoreFrameEnd = true;
        } else if (item.ignoreParentFrame) {
            dock = item.dock;
            pos -= ownerContext.borderInfo[dock] + ownerContext.paddingInfo[dock] +
                   ownerContext.framingInfo[dock];

            axis.ignoreFrameBegin = true;
        }

        if (!item.overlay) {
            size = itemContext.getProp(sizeProp) + itemContext.getMarginInfo()[sizeProp];
            pos -= size;
            axis.begin = pos;
        }

        return pos;
    },

    /**
     * Docks an item on an auto-size axis at the "end". The "end" of the horizontal axis is
     * "right" and the vertical is "bottom".
     * @private
     */
    dockOutwardEnd: function (ownerContext, itemContext, item, axis) {
        var pos = axis.end,
            sizeProp = axis.sizeProp,
            dock, size;

        size = itemContext.getProp(sizeProp) + itemContext.getMarginInfo()[sizeProp];

        if (axis.collapsed) {
            axis.ignoreFrameBegin = axis.ignoreFrameEnd = true;
        } else if (item.ignoreParentFrame) {
            dock = item.dock;
            pos += ownerContext.borderInfo[dock] + ownerContext.paddingInfo[dock] +
                   ownerContext.framingInfo[dock];

            axis.ignoreFrameEnd = true;
        }

        if (!item.overlay) {
            axis.end = pos + size;
        }

        return pos;
    },

    /**
     * Docks an item that might stretch across an axis. This is done for dock "top" and
     * "bottom" items on the horizontal axis and dock "left" and "right" on the vertical.
     */
    dockStretch: function (ownerContext, itemContext, item, axis) {
        var dock = item.dock, // left/top/right/bottom (also used to index padding/border)
            sizeProp = axis.sizeProp, // 'width' or 'height'
            horizontal = dock == 'top' || dock == 'bottom',
            offsets = itemContext.offsets,
            border = ownerContext.borderInfo,
            padding = ownerContext.paddingInfo,
            endProp = horizontal ? 'right' : 'bottom',
            startProp = horizontal ? 'left' : 'top',
            pos = axis.begin + offsets[startProp],
            margin, size, framing;

        if (item.stretch !== false) {
            size = axis.end - pos - offsets[endProp];

            if (item.ignoreParentFrame) {
                framing = ownerContext.framingInfo;
                pos -= border[startProp] + padding[startProp] + framing[startProp];
                size += border[sizeProp] + padding[sizeProp] + framing[sizeProp];
            }

            margin = itemContext.getMarginInfo();
            size -= margin[sizeProp];

            itemContext[axis.setSize](size);
        }

        return pos;
    },

    /**
     * Finishes the calculation of an axis by publishing its size or measuredSize.
     */
    finishAxis: function (ownerContext, axis) {
        var size = axis.end - axis.begin,
            sizeProp = axis.sizeProp,
            sizePropCap = axis.sizePropCap,
            setSizeMethod = axis.setSize,
            beginName = axis.dockBegin, // left or top
            endName = axis.dockEnd, // right or bottom
            border = ownerContext.borderInfo,
            padding = ownerContext.paddingInfo,
            framing = ownerContext.framingInfo,
            frameSize = padding[beginName] + border[beginName] + framing[beginName],
            frameBody;

        if (axis.auto) {
            // Since items docked left/top on an auto-size axis go into negative coordinates,
            // we apply a delta to all coordinates to adjust their relative origin back to
            // (0,0).
            axis.delta = -axis.begin;  // either 0 or a positive number

            ownerContext.bodyContext[setSizeMethod](axis.initialSize);

            if (axis.ignoreFrameBegin) {
                axis.delta -= border[beginName];
                ownerContext.bodyContext.setProp(axis.posProp, -axis.begin - frameSize);
            } else {
                size += frameSize;
                axis.delta += padding[beginName] + framing[beginName];
                ownerContext.bodyContext.setProp(axis.posProp, -axis.begin);
            }

            if (!axis.ignoreFrameEnd) {
                size += padding[endName] + border[endName] + framing[endName];
            }

            ownerContext.setProp('measured' + sizePropCap, size);

            if (ownerContext[sizeProp + 'Authority'] === 0) {
                ownerContext[setSizeMethod](size);
            }
        } else {
            // For a fixed-size axis, we started at the outer box and already have the
            // proper origin... almost... except for the owner's border.
            axis.delta = -border[axis.dockBegin]; // 'left' or 'top'

            // Body size is remaining space between ends of Axis.
            ownerContext.bodyContext[setSizeMethod](size);
            ownerContext.bodyContext.setProp(axis.posProp, axis.begin - frameSize);
        }

        return !isNaN(size);
    },

    /**
     * Finishes the calculation by setting positions on the body and all of the items.
     */
    finishPositions: function (ownerContext, horz, vert) {
        var dockedItems = ownerContext.dockedItems,
            length = dockedItems.length,
            deltaX = horz.delta,
            deltaY = vert.delta,
            index, itemContext;

        for (index = 0; index < length; ++index) {
            itemContext = dockedItems[index];

            itemContext.setProp('x', deltaX + itemContext.dockedAt.x);
            itemContext.setProp('y', deltaY + itemContext.dockedAt.y);
        }
    },

    finishedLayout: function(ownerContext) {
        var me = this,
            target = ownerContext.target;

        me.callParent(arguments);
        if (!ownerContext.animatePolicy) {
            if (ownerContext.isCollapsingOrExpanding === 1) {
                target.afterCollapse();
            } else if (ownerContext.isCollapsingOrExpanding === 2) {
                target.afterExpand();
            }
        }
    },

    getContentWidth: function (ownerContext) {
        return ownerContext.bodyContext.el.getWidth();
    },

    getContentHeight: function (ownerContext) {
        return ownerContext.bodyContext.el.getHeight();
    },

    /**
     * Retrieve an ordered and/or filtered array of all docked Components.
     * @param {String} order The desired ordering of the items ('render' or 'visual'). The
     *  default is 'render' order.
     * @param {Boolean} beforeBody An optional flag to limit the set of items to only those
     *  before the body (true) or after the body (false). All components are returned by
     *  default.
     * @return {Ext.Component[]} An array of components.
     */
    getDockedItems: function (order, beforeBody) {
        var me = this,
            all = me.owner.dockedItems.items,
            sort = all && all.length && order !== false,
            dock, dockedItems, i, isBefore, length;

        if (typeof beforeBody == 'undefined') {
            dockedItems = sort ? all.slice() : all;
        } else {
            dockedItems = [];

            for (i = 0, length = all.length; i < length; ++i) {
                dock = all[i].dock;
                isBefore = (dock == 'top' || dock == 'left');
                if (beforeBody ? isBefore : !isBefore) {
                    dockedItems.push(all[i]);
                }
            }

            sort = sort && dockedItems.length;
        }

        if (sort) {
            order = order || 'render';
            Ext.Array.sort(dockedItems, function(a, b) {
                var aw = me.getItemWeight(a, order),
                    bw = me.getItemWeight(b, order);

                if ((aw !== undefined) && (bw !== undefined)) {
                    return aw - bw;
                }
                return 0;
            });
        }

        return dockedItems || [];
    },

    getItemWeight: function (item, order) {
        var weight = item.weight || this.owner.defaultDockWeights[item.dock];
        return weight[order] || weight;
    },

    /**
     * @protected
     * Returns an array containing all the <b>visible</b> docked items inside this layout's owner Panel
     * @return {Array} An array containing all the <b>visible</b> docked items of the Panel
     */
    getLayoutItems : function() {
        var me = this,
            it,
            ln,
            i,
            result;

        if (me.owner.collapsed) {
            result = me.owner.getCollapsedDockedItems();
        } else {
            it = me.getDockedItems('visual');
            ln = it.length;
            result = [];
            for (i = 0; i < ln; i++) {
                if (it[i].isVisible(true)) {
                    result.push(it[i]);
                }
            }
        }
        return result;
    },
    
    redoLayout: function(ownerContext) {
        var me = this,
            owner = me.owner;
        
        // If we are collapsing...
        if (ownerContext.isCollapsingOrExpanding == 1) {
            if (owner.reExpander) {
                owner.reExpander.el.show();
            }
            // Add the collapsed class now, so that collapsed CSS rules are applied before measurements are taken by the layout.
            owner.addClsWithUI(owner.collapsedCls);
            ownerContext.redo(true);
        } else if (ownerContext.isCollapsingOrExpanding == 2) {
            // Remove the collapsed class now, before layout calculations are done.
            owner.removeClsWithUI(owner.collapsedCls);
            ownerContext.bodyContext.redo();
        } 
    },

    /**
     * @protected
     * Render the top and left docked items before any existing DOM nodes in our render target,
     * and then render the right and bottom docked items after. This is important, for such things
     * as tab stops and ARIA readers, that the DOM nodes are in a meaningful order.
     * Our collection of docked items will already be ordered via Panel.getDockedItems().
     */
    renderItems: function(items, target) {
        var cns = target.dom.childNodes,
            cnsLn = cns.length,
            ln = items.length,
            domLn = 0,
            i, j, cn, item;

        // Calculate the number of DOM nodes in our target that are not our docked items
        for (i = 0; i < cnsLn; i++) {
            cn = Ext.get(cns[i]);
            for (j = 0; j < ln; j++) {
                item = items[j];
                if (item.rendered && (cn.id == item.el.id || cn.contains(item.el.id))) {
                    break;
                }
            }

            if (j === ln) {
                domLn++;
            }
        }

        // Now we go through our docked items and render/move them
        for (i = 0, j = 0; i < ln; i++, j++) {
            item = items[i];

            // If we're now at the right/bottom docked item, we jump ahead in our
            // DOM position, just past the existing DOM nodes.
            //
            // TODO: This is affected if users provide custom weight values to their
            // docked items, which puts it out of (t,l,r,b) order. Avoiding a second
            // sort operation here, for now, in the name of performance. getDockedItems()
            // needs the sort operation not just for this layout-time rendering, but
            // also for getRefItems() to return a logical ordering (FocusManager, CQ, et al).
            if (i === j && (item.dock === 'right' || item.dock === 'bottom')) {
                j += domLn;
            }

            // Same logic as Layout.renderItems()
            if (item && !item.rendered) {
                this.renderItem(item, target, j);
            }
            else if (!this.isValidParent(item, target, j)) {
                this.moveItem(item, target, j);
            }
        }
    },

    undoLayout: function(ownerContext) {
        var me = this,
            owner = me.owner;
        
        // If we are collapsing...
        if (ownerContext.isCollapsingOrExpanding == 1) {

            // We do not want to see the re-expander header until the final collapse is complete
            if (owner.reExpander) {
                owner.reExpander.el.hide();
            }
            // Add the collapsed class now, so that collapsed CSS rules are applied before measurements are taken by the layout.
            owner.removeClsWithUI(owner.collapsedCls);
            ownerContext.undo(true);
        } else if (ownerContext.isCollapsingOrExpanding == 2) {
            // Remove the collapsed class now, before layout calculations are done.
            owner.addClsWithUI(owner.collapsedCls);
            ownerContext.bodyContext.undo();
        } 
    },

    sizePolicy: {
        nostretch: {
            setsWidth: 0,
            setsHeight: 0
        },
        stretchH: {
            setsWidth: 1,
            setsHeight: 0
        },
        stretchV: {
            setsWidth: 0,
            setsHeight: 1
        },

        // Circular dependency with partial auto-sized panels:
        //
        // If we have an autoHeight docked item being stretched horizontally (top/bottom),
        // that stretching will determine its width and its width must be set before its
        // autoHeight can be determined. If that item is docked in an autoWidth panel, the
        // body will need its height set before it can determine its width, but the height
        // of the docked item is needed to subtract from the panel height in order to set
        // the body height.
        //
        // This same pattern occurs with autoHeight panels with autoWidth docked items on
        // left or right. If the panel is fully auto or fully fixed, these problems don't
        // come up because there is no dependency between the dimensions.
        //
        // Cutting the Gordian Knot: In these cases, we have to allow something to measure
        // itself without full context. This is OK as long as the managed dimension doesn't
        // effect the auto-dimension, which is often the case for things like toolbars. The
        // managed dimension only effects overflow handlers and such and does not change the
        // auto-dimension. To encourage the item to measure itself without waiting for the
        // managed dimension, we have to tell it that the layout will also be reading that
        // dimension. This is similar to how stretchmax works.

        autoStretchH: {
            readsWidth: 1,
            setsWidth: 1,
            setsHeight: 0
        },
        autoStretchV: {
            readsHeight: 1,
            setsWidth: 0,
            setsHeight: 1
        }
    },

    getItemSizePolicy: function (item) {
        var policy = this.sizePolicy,
            dock, owner, autoWidth, autoHeight, vertical;

        if (item.stretch === false) {
            return policy.nostretch;
        }

        owner = this.owner;
        autoWidth = !owner.isFixedWidth();
        autoHeight = !owner.isFixedHeight();
        dock = item.dock;
        vertical = (dock == 'left' || dock == 'right');

        /*if (autoWidth !== autoHeight) { // if (partial auto)
            // see above...
            if (vertical) {
                if (autoHeight) {
                    return policy.autoStretchV;
                }
            } else if (autoWidth) {
                return policy.autoStretchH;
            }
        }*/

        if (vertical) {
            return policy.stretchV;
        }

        return policy.stretchH;
    },

    /**
     * @protected
     * We are overriding the Ext.layout.Layout configureItem method to also add a class that
     * indicates the position of the docked item. We use the itemCls (x-docked) as a prefix.
     * An example of a class added to a dock: right item is x-docked-right
     * @param {Ext.Component} item The item we are configuring
     */
    configureItem : function(item, pos) {
        this.callParent(arguments);

        item.addCls(Ext.baseCSSPrefix + 'docked');
        item.addClsWithUI('docked-' + item.dock);
    },

    afterRemove : function(item) {
        this.callParent(arguments);
        if (this.itemCls) {
            item.el.removeCls(this.itemCls + '-' + item.dock);
        }
        var dom = item.el.dom;

        if (!item.destroying && dom) {
            dom.parentNode.removeChild(dom);
        }
        this.childrenChanged = true;
    }
});
