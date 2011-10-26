/**
 * This override adds diagnostics to the {@link Ext.layout.ContextItem} class.
 */
Ext.define('Ext.diag.layout.ContextItem', {

    override: 'Ext.layout.ContextItem',

    addBlock: function (name, layout, propName) {
        //Ext.log(this.id,'.',propName,' ',name,': ',layout.owner.id,':',layout.type);
        (layout.blockedBy || (layout.blockedBy = {}))[
            this.id+'.'+propName+(name.substring(0,3)=='dom' ? ':dom' : '')] = 1;

        return this.callParent(arguments);
    },

    addBoxChild: function (boxChildItem) {
        var ret = this.callParent(arguments),
            boxChildren = this.boxChildren,
            boxParents;

        if (boxChildren && boxChildren.length == 1) {
            // the boxParent collection is created by the run override found in
            // Ext.diag.layout.Context, but IE sometimes does not load that override, so
            // we work around it for now
            boxParents = this.context.boxParents ||
                        (this.context.boxParents = new Ext.util.MixedCollection());
            boxParents.add(this);
        }

        return ret;
    },

    addTrigger: function (propName, inDom) {
        var name = inDom ? 'domTriggers' : 'triggers',
            layout = this.context.currentLayout,
            result = this.callParent(arguments);

        //Ext.log(this.id,'.',propName,' ',name,' ',layout.owner.id,':',layout.type);

        if (result) {
            (layout.triggeredBy || (layout.triggeredBy = {}))[
                this.id+'.'+propName+(inDom ? ':dom' : '')] = {
                    item: this,
                    name: propName
                };
        } else {
            //console.log(me.target.el.dom, (' ' + layout.type + '/' + me.id + ' is asking for the ' + propName + ' which it is supposed to provide'));
        }

        return result;
    },

    clearBlocks: function (name, propName) {
        var collection = this[name],
            blockedLayouts = collection && collection[propName],
            key = this.id+'.'+propName+(name.substring(0,3)=='dom' ? ':dom' : ''),
            layout, layoutId;

        if (blockedLayouts) {
            for (layoutId in blockedLayouts) {
                layout = blockedLayouts[layoutId];
                delete layout.blockedBy[key];
            }
        }
        return this.callParent(arguments);
    },

    doInvalidate: function () {
        //Ext.log('doInvalidate: ', this.id);
        return this.callParent(arguments);
    },

    getEl: function (el) {
        var child = this.callParent(arguments);
        if (child && child !== this && child.parent !== this) {
            //debugger;
        }
        return child;
    },

    invalidate: function () {
        if (this.wrapsComponent) {
            //Ext.log('invalidate: ', this.id);
        } else {
            //debugger;
        }
        return this.callParent(arguments);
    },

    setProp: function (propName, value, dirty) {
        var me = this,
            layout = me.context.currentLayout,
            setBy = layout.owner.id + '<' + layout.type + '>',
            fullName = me.id + '.' + propName,
            setByProps;

        if (value !== null) {
            setByProps = me.setBy || (me.setBy = {});
            if (!setByProps[propName]) {
                setByProps[propName] = setBy;
            } else if (setByProps[propName] != setBy) {
                Ext.log({level: 'warn'}, 'BAD! ', fullName, ' set by ', setByProps[propName], ' and ', setBy);
            }
        }

        if (typeof value != 'undefined' && !isNaN(value) && me.props[propName] !== value) {
            //Ext.log('set ', fullName, ' = ', value, ' (', dirty, ')');
        }

        return this.callParent(arguments);
    }
});
