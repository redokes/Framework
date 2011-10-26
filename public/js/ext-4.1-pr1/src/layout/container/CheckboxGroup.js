/**
 * @class Ext.layout.container.CheckboxGroup
 * <p>This layout implements the column arrangement for {@link Ext.form.CheckboxGroup} and {@link Ext.form.RadioGroup}.
 * It groups the component's sub-items into columns based on the component's
 * {@link Ext.form.CheckboxGroup#columns columns} and {@link Ext.form.CheckboxGroup#vertical} config properties.</p>
 *
 */
Ext.define('Ext.layout.container.CheckboxGroup', {
    extend: 'Ext.layout.container.Container',
    alias: ['layout.checkboxgroup'],

    childGeneration: 0,

    /**
     * @cfg {Boolean} percentWidthColumns
     * True to enable left and width element styles using percentages. For example, the
     * "width:25%" style would be used for 4 columns (assuming no widths or flexes are
     * specified).
     */
    percentWidthColumns: true,

    type: 'checkboxgroup',

    childEls: [
        'innerCt'
    ],

    renderTpl: [
        '<div id="{ownerId}-innerCt" class="{[values.$layout.innerCls]}" role="presentation">',
            '{% for (var i=0, len=values.columnCount; i<len; ++i) { %}',
                '<div class="{colCls}"',
                    '{% if (values.percent) { %}',
                        ' style="width:{percent}%;left:{[i * values.percent]}%"',
                    '{% } %}',
                    '>{% this.renderColumn(out,values,i) %}',
                '</div>',
            '{% } %}',
        '</div>'
    ],

    beginLayout: function(ownerContext) {
        var me = this,
            columns = me.columns,
            numCols = columns.length,
            nonFlexedWidth = 0,
            totalFlex = 0,
            i, column, columnContext, columnContexts;

        me.callParent(arguments);

        // If the child items have changed since the last layout then we need to fixup
        // the association of items to columns:
        if (me.lastChildGeneration != me.childGeneration) {
            me.lastChildGeneration = me.childGeneration;
            me.fixColumns();
        }

        // Clear the innerCt size so it doesn't influence the child items.
        me.innerCt.setSize(null, null);

        // Sum flexes and widths since columns are either flexed or fixed-width. Also,
        // build an array of ContextItem's for each columnEl to avoid calling getEl
        // all the time.
        ownerContext.innerCtContext = ownerContext.getEl('innerCt', me);
        ownerContext.columnContexts = columnContexts = [];

        for (i = 0; i < numCols; ++i) {
            columnContext = ownerContext.getEl(column = columns[i]);

            columnContexts.push(columnContext);

            if (!me.percentWidthColumns) {
                // column.setWidth(null); TODO???
            }

            if (column.flex) {
                totalFlex += column.flex;
                columnContext.flex = column.flex;
            } else {
                nonFlexedWidth += column.width;
                columnContext.setWidth(column.width);
            }
        }

        ownerContext.nonFlexedWidth = nonFlexedWidth;
        ownerContext.totalFlex = totalFlex;
    },

    cacheElements: function () {
        var me = this,
            columns = [],
            i, el, numCols, width;

        me.callParent();
        me.columns = columns;

        // all childNodes of innerCt are column divs:
        for (el = me.innerCt.dom.firstChild; el; el = el.nextSibling) {
            columns.push(Ext.get(el));
        }

        // The columns config may be an array of widths. Any value < 1 is taken to be a flex:
        if (!me.percentWidthColumns) {
            numCols = columns.length;
            if (me.columnsArray) {
                for (i = 0; i < numCols; i++) {
                    width = me.owner.columns[i];
                    columns[i][(width < 1) ? 'flex' : 'width'] = width;
                }
            } else {
                // this won't run unless we force percentWidthColumns to false
                for (i = 0; i < numCols; i++) {
                    columns[i].flex = 1;
                }
            }
        }

        // we just rendered so the items are in the correct columns:
        me.lastChildGeneration = me.childGeneration;
    },

    /*
     * The owner.columns config is either a number of columns - which means they are all autoWidth to an even width using CSS % widths
     * or, it may be an array of width values where <1 means it's a flex value and >=1 means it's a required width
     */
    calculate: function(ownerContext) {
        var me = this,
            columns, i, childContext, contentHeight, blocked, childItems, length, height;

        me.calculateWidths(ownerContext);

        // Now that the columnEls are positioned and (more importantly) widthed, we need
        // to wait for the items to finish their layouts before we can properly measure the
        // columnEls' height. The simplest way to do that is block on the height property
        // for all the items.
        //
        if (me.done) {
            childItems = ownerContext.childItems;
            length = childItems.length;

            for (i = 0; i < length; ++i) {
                childContext = childItems[i];
                if (!childContext.hasDomProp('height')) {
                    childContext.domBlock(me, 'height');
                    blocked = true;
                }
            }

            if (blocked) {
                me.done = false;
            } else {
                contentHeight = me.labelEl ? me.labelEl.getHeight() : 0;
                columns = me.columns;
                length = columns.length;

                for (i = 0; i < length; ++i) {
                    height = columns[i].getHeight();
                    contentHeight = Math.max(contentHeight, height);
                }

                ownerContext.innerCtContext.setHeight(contentHeight);
                ownerContext.setContentHeight(contentHeight);
            }
        }
    },

    /**
     * Calculate the column widths and publish the contentWidth if we can.
     */
    calculateWidths: function(ownerContext) {
        var me = this,
            columnContexts = ownerContext.columnContexts,
            numCols = columnContexts.length,
            contentWidth = 0,
            targetSize = me.getContainerSize(ownerContext),
            totalFlex = ownerContext.totalFlex,
            availableWidth = targetSize.width - ownerContext.nonFlexedWidth,
            i, columnContext, width;

        if (me.percentWidthColumns) {
            // We only need to perform width calculations if the columns are *not* all to be
            // auto width evenly
            contentWidth = targetSize.width;
        } else {
            if (me.autoWidth) {
                //<debug>
                if (totalFlex) {
                    Ext.Error.raise('Cannot combine flex and autoWidth in '+me.type);
                }
                //</debug>
            } else if (!Ext.isNumber(availableWidth)) {
                // we have already assigned fixed widths to columns (beginLayout), so we
                // cannot proceed further w/o the target width.
                me.done = false;
                return;
            }

            // Allocate flexes and set x positions
            for (i = 0; i < numCols; i++) {
                columnContext = columnContexts[i];

                if (columnContext.flex) {
                    width = Math.ceil(availableWidth * columnContext.flex / totalFlex);
                    columnContext.setWidth(width);
                } else {
                    width = columnContext.target.width; // already set by beginLayout
                }

                columnContext.setProp('x', contentWidth);
                contentWidth += width;
            }
        }

        if (!ownerContext.setContentWidth(contentWidth)) {
            me.done = false;
        }
    },

    doRenderColumn: function (out, renderData, columnIndex) {
        // Careful! This method is bolted on to the renderTpl so all we get for context is
        // the renderData! The "this" pointer is the renderTpl instance!

        var me = renderData.$layout,
            owner = me.owner,
            columnCount = renderData.columnCount,
            items = owner.items.items,
            itemCount = items.length,
            item, itemIndex, rowCount, increment, tree;

        // Example:
        //      columnCount = 3
        //      items.length = 10

        if (owner.vertical) {
            //        0   1   2
            //      +---+---+---+
            //    0 | 0 | 4 | 8 |
            //      +---+---+---+
            //    1 | 1 | 5 | 9 |
            //      +---+---+---+
            //    2 | 2 | 6 |   |
            //      +---+---+---+
            //    3 | 3 | 7 |   |
            //      +---+---+---+

            rowCount = Math.ceil(itemCount / columnCount); // = 4
            itemIndex = columnIndex * rowCount;
            itemCount = Math.min(itemCount, itemIndex + rowCount);
            increment = 1;
        } else {
            //        0   1   2
            //      +---+---+---+
            //    0 | 0 | 1 | 2 |
            //      +---+---+---+
            //    1 | 3 | 4 | 5 |
            //      +---+---+---+
            //    2 | 6 | 7 | 8 |
            //      +---+---+---+
            //    3 | 9 |   |   |
            //      +---+---+---+

            itemIndex = columnIndex;
            increment = columnCount;
        }

        for ( ; itemIndex < itemCount; itemIndex += increment) {
            item = items[itemIndex];
            me.configureItem(item);
            tree = item.getRenderTree();
            Ext.DomHelper.generateMarkup(tree, out);
        }
    },

    // Distribute child items between column elements according to row first or
    // column first order
    fixColumns: function () {
        var me = this,
            owner = me.owner,
            columns = me.columns,
            items = owner.items.items,
            columnCount = columns.length,
            itemCount = items.length,
            columnIndex, i, rowCount;

        if (owner.vertical) {
            columnIndex = -1; // first loop will increment this to 0
            rowCount = Math.ceil(itemCount / columnCount);

            for (i = 0; i < itemCount; ++i) {
                if (i % rowCount === 0) {
                    ++columnIndex;
                }
                columns[columnIndex].appendChild(items[i].el.dom);
            }
        } else {
            for (i = 0; i < itemCount; ++i) {
                columnIndex = i % columnCount;
                columns[columnIndex].appendChild(items[i].el.dom);
            }
        }
    },

    /**
     * Returns the number of columns in the checkbox group.
     * @private
     */
    getColumnCount: function() {
        var owner = this.owner,
            ownerColumns = owner.columns;

        if (this.columnsArray) {
            return ownerColumns.length;
        }
        if (Ext.isNumber(ownerColumns)) {
            return ownerColumns;
        }
        return owner.items.length;
    },

    getItemSizePolicy: function (item) {
        return this.autoSizePolicy;
    },

    getRenderData: function () {
        var me = this,
            data = me.callParent(),
            owner = me.owner;

        data.colCls = owner.groupCls + ' ' + Ext.baseCSSPrefix + 'box-item';
        data.columnCount = me.getColumnCount();
        data.percent = me.percentWidthColumns && (100 / data.columnCount);

        return data;
    },

    // Overridden method from AbstractContainer.
    getRenderTarget: function() {
        return this.innerCt;
    },

    initLayout: function () {
        var me = this,
            owner = me.owner;

        me.columnsArray = Ext.isArray(owner.columns);
        // percentWidthColumns defaults to true, but only applies if columns is an array:
        me.percentWidthColumns = me.percentWidthColumns && !me.columnsArray;

        me.callParent();
    },

    // Always valid. beginLayout ensures the encapsulating elements of all children are in the correct place
    isValidParent: function() {
        return true;
    },

    onAdd: function () {
        this.callParent(arguments);
        ++this.childGeneration;
    },

    onRemove: function () {
        this.callParent(arguments);
        ++this.childGeneration;
    },

    setupRenderTpl: function (renderTpl) {
        this.callParent(arguments);

        renderTpl.renderColumn = this.doRenderColumn;
    }
});
