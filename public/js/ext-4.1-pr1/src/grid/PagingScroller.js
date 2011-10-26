/**
 * @class Ext.grid.PagingScroller
 * <p>This class monitors scrolling of the {@link Ext.view.Table TableView} within a {@link Ext.grid.Panel GridPanel} which is
 * using a buffered store to only cache and render a small section of a very large dataset.</p>
 * <p>The GridPanel will instantiate this to perform monitoring, this class should never be instantiated by user code.</p>
 */
Ext.define('Ext.grid.PagingScroller', {

    /**
     * @cfg {Number} percentageFromEdge This is a number above 0 and less than 1 which specifies
     * at what percentage to begin fetching the next page. For example if the pageSize is 100
     * and the percentageFromEdge is the default of 0.35, the paging scroller will prefetch pages
     * when scrolling up between records 0 and 34 and when scrolling down between records 65 and 99.
     */
    percentageFromEdge: 0.35,

    /**
     * @cfg {Number} scrollToLoadBuffer This is the time in milliseconds to buffer load requests
     * when scrolling the PagingScrollbar.
     */
    scrollToLoadBuffer: 200,

    activePrefetch: true,

    chunkSize: 50,
    snapIncrement: 25,

    constructor: function(config) {
        var me = this,
            listeners = {
            scroll: {
                fn: me.onViewScroll,
                element: 'el',
                scope: me
            },
            render: me.onViewRender,
            refresh: me.onViewRefresh,
            scope: me
        };
        Ext.apply(me, config);

        // Prepare for the most common scnerio: An initial load of page one, followed by controlled scrolling downwards
        if (me.store) {
            if (me.store.loaded) {
                if (me.store.getTotalCount()) {
                    me.store.prefetchPage(2);
                }
            }
        } else {
            me.store.on({
                load: function() {
                    me.store.prefetchPage(2);
                },
                single: true
            });
        }

        // Calculate our scroll limit based upon the Store's page size.
        me.numFromEdge = Math.max(Math.ceil(me.percentageFromEdge * me.store.pageSize), 20);

        /**
         * @property {Number} current pixel scroll position of the associated {@link Ext.view.Table View}
         */
        me.position = 0;

        if (me.variableRowHeight) {
            listeners.beforerefresh = me.beforeViewRefresh;
        }
        me.view.on(listeners);
        me.store.on({
            guaranteedrange: me.onGuaranteedRange,
            scope: me
        });
        me.callParent(arguments);
    },

    // Ensure that the stretcher element is inserted into the View as the first element.
    onViewRender: function() {
        var me = this,
            el = me.view.el;

        el.setStyle('position', 'relative');
        me.stretcher = el.createChild({
            style:{
                position: 'absolute',
                width: '1px',
                height: 0,
                top: 0,
                left: 0
            }
        }, el.dom.firstChild);
    },

    // Used for variable row heights. Find which 
    beforeViewRefresh: function() {
        var me = this,
            view = me.view,
            table = view.el.child('table'),
            store = me.store,
            newFirstRecord = store.getAt(0),
            newLastRecord = store.getAt(store.getCount() - 1),
            oldRows = me.view.el.query('tr'),
            len = oldRows.length - 1,
            i, rec;

        // Skip the column size and find the row which represents the new top.
        for (i = 1; i < len; i++) {
            rec = view.getRecord(oldRows[i]);
            if (rec === newFirstRecord) {
                me.newTableTop = table.getTop(true) + Ext.fly(oldRows[i]).getOffsetsTo(table)[1];
                return;
            } else if (rec === newLastRecord) {
                
            }
        }
    },

    // Ensure, upon each refresh, that the stretcher element is the correct height
    onViewRefresh: function() {
        var me = this,
            newScrollHeight = me.getScrollHeight(),
            table;

        me.stretcher.setHeight(newScrollHeight);
        if (me.variableRowHeight && me.newTableTop) {
            table = me.view.el.child('table', true);
            table.style.position = 'absolute';
            table.style.top = me.newTableTop + 'px';
        }
    },

    // Not used yet. Adjust page size to accomodate the scrolling zone around the visible zone.
    fixEdges: function() {
        var me = this,
            store = me.store,
            scrollZoneSize = me.numFromEdge * 2,
            visibleCount = me.getLastVisibleRowIndex() - me.getFirstVisibleRowIndex() + 1;

        // If our visible extremites are outside the scroll trigger range, we need to expand the page size.
        if ((store.pageSize - scrollZoneSize) <= visibleCount) {
            store.on({
                beforeload: function() {
                    store.pageSize = Math.ceil((visibleCount + scrollZoneSize) / me.snapIncrement) * me.snapIncrement;
                }
            });
        }
    },

    onGuaranteedRange: function(range, start, end) {
        var me = this,
            ds = me.store;

        // this should never happen
        if (range.length && me.visibleStart < range[0].index) {
            return;
        }

        ds.loadRecords(range);

        if (!me.firstLoad) {
            me.firstLoad = true;
        } else if (!me.variableRowHeight) {
            // adjust top position of the <table> element so that the
            // correct range of rows is in view
            me.view.el.child('table').setStyle({
                position: 'absolute',
                top: (me.store.guaranteedStart * me.rowHeight) + 'px'
            });
        }
    },

    onViewScroll: function(e, t) {
        var me = this,
            view = me.view,
            lastPosition = me.position,
            direction;

        me.position = view.el.dom.scrollTop;
        direction = me.position > lastPosition ? 1 : -1;
        me.handleViewScroll(e, direction);
    },

    handleViewScroll: function(e, direction) {
        var me = this,
            store = me.store,
            pageSize = store.pageSize,
            guaranteedStart = store.guaranteedStart,
            guaranteedEnd = store.guaranteedEnd,
            totalCount = store.getTotalCount(),
            numFromEdge = Math.max(Math.ceil(me.percentageFromEdge * store.pageSize), 20),
            visibleStart = me.getFirstVisibleRowIndex(),
            visibleEnd = me.getLastVisibleRowIndex(),
            prefetchPage = Math.floor(visibleStart / store.pageSize),
            lastPage = Math.ceil(totalCount / store.pageSize),
            requestStart,
            requestEnd;

        // Only process if the total rows is larger than the visible page size
        if (totalCount >= pageSize) {
            // We're scrolling up
            if (direction == -1) {
                if (visibleStart < (guaranteedStart + numFromEdge)) {
                    requestStart = Math.floor(Math.max((visibleEnd + (me.snapIncrement - 1)) - pageSize, 0) / me.snapIncrement) * me.snapIncrement;
                }
                
                // Scrolling upwards, we probably need to see currentPage - 1
                // If that is zero, prepare for downward scrolling instead.
                prefetchPage = Math.floor(visibleStart / store.pageSize) || 2;
            }
            // We're scrolling down
            else {
                if (visibleEnd > (guaranteedEnd - numFromEdge)) {
                    requestStart = Math.floor(visibleStart / me.snapIncrement) * me.snapIncrement;
                }
                prefetchPage = Math.floor(visibleEnd / store.pageSize) + 2;
            }
            

            // We scrolled close to the edge and the Store needs reloading
            if (requestStart !== undefined) {
                requestEnd = requestStart + pageSize - 1;

                // End of request was past end of Store: Ensure last page is visible
                if (requestEnd > totalCount - 1) {
                    me.cancelLoad();
                    if (!store.rangeSatisfied(totalCount - pageSize, totalCount - 1)) {
                        store.guaranteeRange(totalCount - pageSize, totalCount - 1);
                    }
                }
                
                // Store's range needs adjusting. Ideally from prefetch buffer.
                else {
                    // Make sure first row is even to ensure correct even/odd row striping
                    requestStart = requestStart & ~1;

                    // If range is satsfied within the prefetch buffer, then just draw it from the prefetch buffer
                    if (store.rangeSatisfied(requestStart, requestEnd)) {
                        me.cancelLoad();
                        store.guaranteeRange(requestStart, requestEnd);
                    } else {
                        me.attemptLoad(requestStart, requestEnd);
                    }

                    // Keep the prefetch buffer primed for the Store to satifsy future loads from.
                    if (prefetchPage > 0 && prefetchPage < lastPage) {
                        store.prefetchPage(prefetchPage);
                    }
                }
            }
        }
    },

    getFirstVisibleRowIndex: function() {
        var me = this,
            store = me.store,
            view = me.view,
            scrollTop = view.el.dom.scrollTop,
            rows,
            table,
            count,
            i,
            rowBottom;

        if (me.variableRowHeight) {
            rows = view.getNodes();
            table = view.el.child('table');
            count = store.getCount();
            for (i = 0; i < count; i++) {
                rowBottom = Ext.fly(rows[i]).getOffsetsTo(table)[1] + rows[i].offsetHeight - scrollTop;
                if (rowBottom > 0) {
                    return i;
                }
            }
        } else {
            return Math.floor(scrollTop / me.rowHeight);
        }
    },

    getLastVisibleRowIndex: function() {
        var me = this,
            store = me.store,
            view = me.view,
            clientHeight = view.el.dom.clientHeight,
            scrollTop = view.el.dom.scrollTop,
            rows,
            table,
            count,
            i,
            rowTop;

        if (me.variableRowHeight) {
            rows = view.getNodes();
            table = view.el.child('table');
            count = store.getCount();
            for (i = count - 1; i >= 0; i--) {
                rowTop = Ext.fly(rows[i]).getOffsetsTo(table)[1] - scrollTop;
                if (rowTop < clientHeight) {
                    return i;
                }
            }
        } else {
            return me.getFirstVisibleRowIndex() + Math.ceil(clientHeight / me.rowHeight);
        }
    },

    getScrollHeight: function() {
        var me = this,
            view   = me.view,
            firstRow,
            store  = me.store,
            rowCount,
            height = 1;

        if (me.variableRowHeight) {
            me.rowHeight = me.view.el.down('table', true).offsetHeight / me.store.pageSize;
        } else if (!me.rowHeight) {
            firstRow = view.el.down(view.getItemSelector());
            me.rowHeight = firstRow ? firstRow.getHeight(false, true) : 0;
        }

        // If the Store is *locally* filtered, use the filtered count from getCount.
        rowCount = store[(!store.remoteFilter && store.isFiltered()) ? 'getCount' : 'getTotalCount']() || 0;
        height = rowCount * me.rowHeight;
        return height;
    },

    attemptLoad: function(start, end) {
        var me = this;
        if (!me.loadTask) {
            me.loadTask = new Ext.util.DelayedTask(me.doAttemptLoad, me, []);
        }
        me.loadTask.delay(me.scrollToLoadBuffer, me.doAttemptLoad, me, [start, end]);
    },

    cancelLoad: function() {
        if (this.loadTask) {
            this.loadTask.cancel();
        }
    },

    doAttemptLoad:  function(start, end) {
        this.store.mask();
        this.store.guaranteeRange(start, end);
    }
});
