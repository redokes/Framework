/**
 * This override adds diagnostics to the {@link Ext.layout.Context} class.
 */
Ext.define('Ext.diag.layout.Context', {

    override: 'Ext.layout.Context',

    requires: [
        'Ext.perf.Monitor'
    ],

    callLayout: function (layout, methodName) {
        var accum = this.accumByType[layout.type],
            frame = accum && accum.enter();

        this.callParent(arguments);

        if (accum) {
            frame.leave();
        }
    },

    flush: function () {
        var items = this.flushQueue;
        //Ext.log('--- Flush ', items && items.getCount());

        return this.callParent(arguments);
    },

    flushInvalidates: function () {
        //Ext.log('>> flushInvalidates');
        var ret = this.callParent(arguments);
        //Ext.log('<< flushInvalidates');
        return ret;
    },

    getCmp: function (target) {
        var ret = this.callParent(arguments);
        if (!ret.wrapsComponent) {
            //debugger;
        }
        return ret;
    },

    getEl: function (parent, target) {
        var ret = this.callParent(arguments);
        if (ret && ret.wrapsComponent) {
            //debugger;
        }
        return ret;
    },

    layoutTreeHasFailures: function (layout, reported) {
        var me = this;

        function hasFailure (lo) {
            var failure = !lo.done;

            if (lo.done) {
                Ext.Object.each(me.layouts, function (id, childLayout) {
                    if (childLayout.owner.ownerLayout === lo) {
                        if (hasFailure(childLayout)) {
                            failure = true;
                        }
                    }
                });
            }

            return failure;
        }

        if (hasFailure(layout)) {
            return true;
        }

        function markReported (lo) {
            reported[lo.id] = 1;

            Ext.Object.each(me.layouts, function (id, childLayout) {
                if (childLayout.owner.ownerLayout === lo) {
                    markReported(childLayout);
                }
            });
        }

        markReported(layout);
        return false;
    },

    queueLayout: function (layout) {
        if (layout.done || layout.blockCount || layout.pending) {
            //debugger;
        }
        //Ext.log('Queue ', layout.owner.id, '<', layout.type, '>');
        return this.callParent(arguments);
    },

    reportLayoutResult: function (layout, reported) {
        var me = this;

        reported[layout.id] = 1;
        if (layout.done) {
            Ext.log({indent: 1}, '++', layout.owner.id, '<', layout.type, '>');
        } else {
            var blockedBy = [], triggeredBy = [];
            Ext.Object.each(layout.blockedBy, function (t) {
                blockedBy.push(t);
            });
            blockedBy.sort();

            Ext.Object.each(layout.triggeredBy, function (name, info) {
                triggeredBy.push({ name: name, info: info });
            });
            triggeredBy.sort(function (a, b) {
                return a.name < b.name ? -1 : (b.name < a.name ? 1 : 0);
            });

            Ext.log({indent: 1}, '--', layout.owner.id, '<', layout.type, '>',
                (layout.owner.ownerCt ? ' - ownerCt: ' + layout.owner.ownerCt.id : ''));

            if (blockedBy.length) {
                ++Ext.log.indent;
                Ext.log({indent: 1}, 'blockedBy:  count=',layout.blockCount);
                Ext.each(blockedBy, function (s) {
                    Ext.log(s);
                });
                Ext.log.indent -= 2;
            }
            if (triggeredBy.length) {
                ++Ext.log.indent;
                Ext.log({indent: 1}, 'triggeredBy: count='+layout.triggerCount);
                Ext.each(triggeredBy, function (t) {
                    var item = t.info.item,
                        setBy = (item.setBy && item.setBy[t.info.name]) || '?';

                    Ext.log(t.name,' (',
                        item.props[t.info.name], ') dirty: ', (item.dirty ? !!item.dirty[t.info.name] : false), ', setBy: ', setBy);
                });
                Ext.log.indent -= 2;
            }
        }

        Ext.Object.each(me.layouts, function (id, childLayout) {
            if (!childLayout.done && childLayout.owner.ownerLayout === layout) {
                me.reportLayoutResult(childLayout, reported);
            }
        });

        Ext.Object.each(me.layouts, function (id, childLayout) {
            if (childLayout.done && childLayout.owner.ownerLayout === layout) {
                me.reportLayoutResult(childLayout, reported);
            }
        });

        --Ext.log.indent;
    },

    resetLayout: function (layout) {
        var me = this,
            type = layout.type,
            accum = me.accumByType[type];

        if (!this.state) { // if (first time ... before run)
            //Ext.log('resetLayout: ', layout.owner.id, '<', layout.type, '>');
            if (!accum) {
                //me.accumByType[type] = accum = Ext.Perf.get('layout_' + layout.type);
            }
            me.numByType[type] = (me.numByType[type] || 0) + 1;
        } else {
            //Ext.log('resetLayout: ', layout.owner.id, '<', layout.type, '>');
        }

        var frame = accum && accum.enter();
        me.callParent(arguments);
        if (accum) {
            frame.leave();
        }
    },

    round: function (t) {
        return Math.round(t * 1000) / 1000;
    },

    run: function () {
        var me = this,
            ret, time;

        me.accumByType = {};
        me.calcsByType = {};
        me.numByType = {};
        me.timesByType = {};

        Ext.log.indentSize = 3;
        Ext.log('==================== LAYOUT ====================');

        time = Ext.perf.getTimestamp();
        ret = me.callParent(arguments);
        time = Ext.perf.getTimestamp() - time;

        /*
        if (me.boxParents) {
            me.boxParents.each(function (boxParent) {
                Ext.log('boxParent: ', boxParent.id);
                for (var i = 0, children = boxParent.boxChildren, n = children.length; i < n; ++i) {
                    Ext.log(' --> ', children[i].id);
                }
            });
        }
        /**/

        if (ret) {
            Ext.log('----------------- SUCCESS -----------------');
        } else {
            Ext.log({level: 'error' },
                '----------------- FAILURE -----------------');
            var reported = {},
                unreported = 0;

            Ext.Object.each(me.layouts, function (id, layout) {
                if (me.items[layout.owner.el.id].isTopLevel) {
                    if (me.layoutTreeHasFailures(layout, reported)) {
                        me.reportLayoutResult(layout, reported);
                    }
                }
            });

            // Just in case we missed any layouts...
            Ext.Object.each(me.layouts, function (id, layout) {
                if (!reported[layout.id]) {
                    if (!unreported) {
                        Ext.log('----- Unreported!! -----');
                    }
                    ++unreported;
                    me.reportLayoutResult(layout, reported);
                }
            });
        }

        Ext.log('Cycles: ', me.cycleCount, ', Flushes: ', me.flushCount,
            ', Calculates: ', me.calcCount, ' in ', me.round(time), ' msec');

        Ext.log('Calculates by type:');
        /*Ext.Object.each(me.numByType, function (type, total) {
            Ext.log(type, ': ', total, ' in ', me.calcsByType[type], ' tries (',
                Math.round(me.calcsByType[type] / total * 10) / 10, 'x) at ',
                me.round(me.timesByType[type]), ' msec (avg ',
                me.round(me.timesByType[type] / me.calcsByType[type]), ' msec)');
        });*/
        var calcs = [];
        Ext.Object.each(me.numByType, function (type, total) {
            calcs.push({
                    type: type,
                    total: total,
                    calcs: me.calcsByType[type],
                    multiple: Math.round(me.calcsByType[type] / total * 10) / 10,
                    calcTime: me.round(me.timesByType[type]),
                    avgCalcTime: me.round(me.timesByType[type] / me.calcsByType[type])
                });
        });
        calcs.sort(function (a,b) {
            return b.calcTime - a.calcTime;
        });
        Ext.each(calcs, function (calc) {
            Ext.log(calc.type, ': ', calc.total, ' in ', calc.calcs, ' tries (',
                calc.multiple, 'x) at ', calc.calcTime, ' msec (avg ', calc.avgCalcTime, ' msec)');
        });
        return ret;
    },

    runCycle: function () {
        //Ext.log('>>> Cycle ', this.cycleCount, ' (queue length: ', this.layoutQueue.length, ')');

        return this.callParent(arguments);
    },

    runLayout: function (layout) {
        var me = this,
            type = layout.type,
            accum = me.accumByType[type],
            frame, ret, time;

        //Ext.log('-- calculate ', layout.owner.id, ':', type);

        frame = accum && accum.enter();

        time = Ext.perf.getTimestamp();
        ret = me.callParent(arguments);
        time = Ext.perf.getTimestamp() - time;
        if (accum) {
            frame.leave();
        }

        me.calcsByType[type] = (me.calcsByType[type] || 0) + 1;
        me.timesByType[type] = (me.timesByType[type] || 0) + time;

        /*  add a / to the front of this line to enable layout completion logging
        if (layout.done) {
            var ownerContext = me.getCmp(layout.owner),
                props = ownerContext.props;

            if (layout.isComponentLayout) {
                Ext.log('complete ', layout.owner.id, ':', type, ' w=',props.width, ' h=', props.height);
            } else {
                Ext.log('complete ', layout.owner.id, ':', type, ' cw=',props.contentWidth, ' ch=', props.contentHeight);
            }
        }/**/

        return ret;
    }
});
