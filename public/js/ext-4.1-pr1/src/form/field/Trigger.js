/**
 * Provides a convenient wrapper for TextFields that adds a clickable trigger button (looks like a combobox by default).
 * The trigger has no default action, so you must assign a function to implement the trigger click handler by overriding
 * {@link #onTriggerClick}. You can create a Trigger field directly, as it renders exactly like a combobox for which you
 * can provide a custom implementation.
 *
 * For example:
 *
 *     @example
 *     Ext.define('Ext.ux.CustomTrigger', {
 *         extend: 'Ext.form.field.Trigger',
 *         alias: 'widget.customtrigger',
 *
 *         // override onTriggerClick
 *         onTriggerClick: function() {
 *             Ext.Msg.alert('Status', 'You clicked my trigger!');
 *         }
 *     });
 *
 *     Ext.create('Ext.form.FormPanel', {
 *         title: 'Form with TriggerField',
 *         bodyPadding: 5,
 *         width: 350,
 *         renderTo: Ext.getBody(),
 *         items:[{
 *             xtype: 'customtrigger',
 *             fieldLabel: 'Sample Trigger',
 *             emptyText: 'click the trigger',
 *         }]
 *     });
 *
 * However, in general you will most likely want to use Trigger as the base class for a reusable component.
 * {@link Ext.form.field.Date} and {@link Ext.form.field.ComboBox} are perfect examples of this.
 */
Ext.define('Ext.form.field.Trigger', {
    extend:'Ext.form.field.Text',
    alias: ['widget.triggerfield', 'widget.trigger'],
    requires: ['Ext.DomHelper', 'Ext.util.ClickRepeater', 'Ext.layout.component.field.Trigger'],
    alternateClassName: ['Ext.form.TriggerField', 'Ext.form.TwinTriggerField', 'Ext.form.Trigger'],

    childEls: [
        /**
         * @property {Ext.CompositeElement} triggerEl
         * A composite of all the trigger button elements. Only set after the field has been rendered.
         */
        { name: 'triggerEl', select: '.' + Ext.baseCSSPrefix + 'form-trigger' },

        /**
         * @property {Ext.Element} triggerWrap
         * A reference to the div element wrapping the trigger button(s). Only set after the field has been rendered.
         */
        'triggerWrap'
    ],

    // note: {id} here is really {inputId}, but {cmpId} is available
    fieldSubTpl: [
        '<input id="{id}" type="{type}"',
            '<tpl if="name"> name="{name}"</tpl>',
            '<tpl if="value"> value="{value}"</tpl>',
            '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
            '<tpl if="size"> size="{size}"</tpl>',
            '<tpl if="maxLength !== undefined"> maxlength="{maxLength}"</tpl>',
            '<tpl if="readOnly"> readonly="readonly"</tpl>',
            '<tpl if="disabled"> disabled="disabled"</tpl>',
            '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
            '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
            'class="{fieldCls} {typeCls}{editableCls}" autocomplete="off" />',
        '<div id="{cmpId}-triggerWrap" class="{triggerWrapCls}" role="presentation"',
            '<tpl if="triggerWrapStyle"> style="{triggerWrapStyle}"</tpl>',
            '>{triggerEl}',
            '<div class="{clearCls}" role="presentation"></div>',
        '</div>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    /**
     * @cfg {String} triggerCls
     * An additional CSS class used to style the trigger button. The trigger will always get the {@link #triggerBaseCls}
     * by default and triggerCls will be **appended** if specified.
     */

    /**
     * @cfg {String} [triggerBaseCls='x-form-trigger']
     * The base CSS class that is always added to the trigger button. The {@link #triggerCls} will be appended in
     * addition to this class.
     */
    triggerBaseCls: Ext.baseCSSPrefix + 'form-trigger',

    /**
     * @cfg {String} [triggerWrapCls='x-form-trigger-wrap']
     * The CSS class that is added to the div wrapping the trigger button(s).
     */
    triggerWrapCls: Ext.baseCSSPrefix + 'form-trigger-wrap',

    /**
     * @cfg {Boolean} hideTrigger
     * true to hide the trigger element and display only the base text field
     */
    hideTrigger: false,

    /**
     * @cfg {Boolean} editable
     * false to prevent the user from typing text directly into the field; the field can only have its value set via an
     * action invoked by the trigger.
     */
    editable: true,

    /**
     * @cfg {Boolean} readOnly
     * true to prevent the user from changing the field, and hides the trigger. Supercedes the editable and hideTrigger
     * options if the value is true.
     */
    readOnly: false,

    /**
     * @cfg {Boolean} [selectOnFocus=false]
     * true to select any existing text in the field immediately on focus. Only applies when
     * {@link #editable editable} = true
     */

    /**
     * @cfg {Boolean} repeatTriggerClick
     * true to attach a {@link Ext.util.ClickRepeater click repeater} to the trigger.
     */
    repeatTriggerClick: false,


    /**
     * @method autoSize
     * Not applicable for Trigger field.
     */
    autoSize: Ext.emptyFn,
    // private
    monitorTab: true,
    // private
    mimicing: false,
    // private
    triggerIndexRe: /trigger-index-(\d+)/,

    componentLayout: 'triggerfield',

    initComponent: function() {
        this.wrapFocusCls = this.triggerWrapCls + '-focus';
        this.callParent(arguments);
    },

    getSubTplData: function() {
        var me = this,
            triggerWrapCls = me.triggerWrapCls,
            triggerBaseCls = me.triggerBaseCls,
            triggerConfigs = [],
            i = 0,
            readOnly, triggerCls;

        me.callParent(arguments);
                
        // TODO this trigger<n>Cls API design doesn't feel clean, especially where it butts up against the
        // single triggerCls config. Should rethink this, perhaps something more structured like a list of
        // trigger config objects that hold cls, handler, etc.
        // triggerCls is a synonym for trigger1Cls, so copy it.
        if (!me.trigger1Cls) {
            me.trigger1Cls = me.triggerCls;
        }

        // Create as many trigger elements as we have trigger<n>Cls configs, but always at least one
        for (i = 0; (triggerCls = me['trigger' + (i + 1) + 'Cls']) || i < 1; i++) {
            triggerConfigs.push({
                cls: [Ext.baseCSSPrefix + 'trigger-index-' + i, triggerBaseCls, triggerCls].join(' '),
                role: 'button'
            });
        }
        triggerConfigs[i - 1].cls += ' ' + triggerBaseCls + '-last';
        
        readOnly = false;
        
        if (me.editable === false || me.readOnly === true) {
            readOnly = true;
        }
        // forced because of Ext.form.Text
        me.subTplData.readOnly = readOnly;

        return Ext.applyIf(me.subTplData, {
            editableCls: (me.readOnly || !me.editable) ? ' ' + Ext.baseCSSPrefix + 'trigger-noedit' : '',
            triggerWrapCls: triggerWrapCls,
            triggerWrapStyle: (me.readOnly || me.hideTrigger) ? 'display:none' : '',
            triggerEl: Ext.DomHelper.markup(triggerConfigs),
            clearCls: me.clearCls
        });
    },
    
    // private
    beforeRender: function() {
        var me = this,
            triggerBaseCls = me.triggerBaseCls;

        me.callParent();

        if (triggerBaseCls != Ext.baseCSSPrefix + 'form-trigger') {
            // we may need to rewrite triggerEl if is triggerBaseCls isn't the value we
            // stuck in childEls
            me.addChildEls({ name: 'triggerEl', select: '.' + triggerBaseCls });
        }

        // these start correct in the fieldSubTpl:
        me.lastTriggerStateFlags = me.getTriggerStateFlags();
    },

    onRender: function() {
        var me = this;

        me.callParent(arguments);

        me.doc = Ext.getDoc();
        me.initTrigger();
    },

    onEnable: function() {
        this.callParent();
        this.triggerWrap.unmask();
    },
    
    onDisable: function() {
        this.callParent();
        this.triggerWrap.mask();
    },

    /**
     * Get the total width of the trigger button area. Only useful after the field has been rendered.
     * @return {Number} The trigger width
     */
    getTriggerWidth: function() {
        var me = this,
            triggerWrap = me.triggerWrap,
            totalTriggerWidth = 0;
        if (triggerWrap && !me.hideTrigger && !me.readOnly) {
            me.triggerEl.each(function(trigger) {
                totalTriggerWidth += trigger.getWidth();
            });
            totalTriggerWidth += me.triggerWrap.getFrameWidth('lr');
        }
        return totalTriggerWidth;
    },

    setHideTrigger: function(hideTrigger) {
        if (hideTrigger != this.hideTrigger) {
            this.hideTrigger = hideTrigger;
            this.updateLayout();
        }
    },

    /**
     * Sets the editable state of this field. This method is the runtime equivalent of setting the 'editable' config
     * option at config time.
     * @param {Boolean} editable True to allow the user to directly edit the field text. If false is passed, the user
     * will only be able to modify the field using the trigger. Will also add a click event to the text field which
     * will call the trigger. 
     */
    setEditable: function(editable) {
        if (editable != this.editable) {
            this.editable = editable;
            this.updateLayout();
        }
    },

    /**
     * Sets the read-only state of this field. This method is the runtime equivalent of setting the 'readOnly' config
     * option at config time.
     * @param {Boolean} readOnly True to prevent the user changing the field and explicitly hide the trigger. Setting
     * this to true will superceed settings editable and hideTrigger. Setting this to false will defer back to editable
     * and hideTrigger.
     */
    setReadOnly: function(readOnly) {
        var me = this,
            old = me.readOnly;
            
        me.callParent(arguments);
        if (me.readOnly != old) {
            me.updateLayout();
        }
    },

    // private
    initTrigger: function() {
        var me = this,
            triggerWrap = me.triggerWrap,
            triggerEl = me.triggerEl;

        if (me.repeatTriggerClick) {
            me.triggerRepeater = new Ext.util.ClickRepeater(triggerWrap, {
                preventDefault: true,
                handler: function(cr, e) {
                    me.onTriggerWrapClick(e);
                }
            });
        } else {
            me.mon(me.triggerWrap, 'click', me.onTriggerWrapClick, me);
        }

        triggerEl.addClsOnOver(me.triggerBaseCls + '-over');
        triggerEl.each(function(el, c, i) {
            el.addClsOnOver(me['trigger' + (i + 1) + 'Cls'] + '-over');
        });
        triggerEl.addClsOnClick(me.triggerBaseCls + '-click');
        triggerEl.each(function(el, c, i) {
            el.addClsOnClick(me['trigger' + (i + 1) + 'Cls'] + '-click');
        });
    },

    // private
    onDestroy: function() {
        var me = this;
        Ext.destroyMembers(me, 'triggerRepeater', 'triggerWrap', 'triggerEl');
        delete me.doc;
        me.callParent();
    },

    // private
    onFocus: function() {
        var me = this;
        me.callParent(arguments);
        if (!me.mimicing) {
            me.bodyEl.addCls(me.wrapFocusCls);
            me.mimicing = true;
            me.mon(me.doc, 'mousedown', me.mimicBlur, me, {
                delay: 10
            });
            if (me.monitorTab) {
                me.on('specialkey', me.checkTab, me);
            }
        }
    },

    // private
    checkTab: function(me, e) {
        if (!this.ignoreMonitorTab && e.getKey() == e.TAB) {
            this.triggerBlur();
        }
    },

    /**
     * Returns a set of flags that describe the trigger state. These are just used to easily
     * determine if the DOM is out-of-sync with the component's properties.
     * @private
     */
    getTriggerStateFlags: function () {
        var me = this,
            state = 0;

        if (me.readOnly) {
            state += 1;
        }
        if (me.editable) {
            state += 2;
        }
        if (me.hideTrigger) {
            state += 4;
        }
        return state;
    },

    /**
     * @private
     * @override
     * The default blur handling must not occur for a TriggerField, implementing this template method as emptyFn disables that.
     * Instead the tab key is monitored, and the superclass's onBlur is called when tab is detected
     */
    onBlur: Ext.emptyFn,

    // private
    mimicBlur: function(e) {
        if (!this.isDestroyed && !this.bodyEl.contains(e.target) && this.validateBlur(e)) {
            this.triggerBlur();
        }
    },

    // private
    triggerBlur: function() {
        var me = this;
        me.mimicing = false;
        me.mun(me.doc, 'mousedown', me.mimicBlur, me);
        if (me.monitorTab && me.inputEl) {
            me.un('specialkey', me.checkTab, me);
        }
        Ext.form.field.Trigger.superclass.onBlur.call(me);
        if (me.bodyEl) {
            me.bodyEl.removeCls(me.wrapFocusCls);
        }
    },

    // private
    // This should be overridden by any subclass that needs to check whether or not the field can be blurred.
    validateBlur: function(e) {
        return true;
    },

    // private
    // process clicks upon triggers.
    // determine which trigger index, and dispatch to the appropriate click handler
    onTriggerWrapClick: function(e) {
        var me = this,
            t = e && e.getTarget('.' + Ext.baseCSSPrefix + 'form-trigger', null),
            match = t && t.className.match(me.triggerIndexRe),
            idx,
            triggerClickMethod;

        if (match && !me.readOnly) {
            idx = parseInt(match[1], 10);
            triggerClickMethod = me['onTrigger' + (idx + 1) + 'Click'] || me.onTriggerClick;
            if (triggerClickMethod) {
                triggerClickMethod.call(me, e);
            }
        }
    },

    /**
     * @method onTriggerClick
     * @protected
     * The function that should handle the trigger's click event. This method does nothing by default until overridden
     * by an implementing function. See Ext.form.field.ComboBox and Ext.form.field.Date for sample implementations.
     * @param {Ext.EventObject} e
     */
    onTriggerClick: Ext.emptyFn

    /**
     * @cfg {Boolean} grow
     * Not applicable for Trigger.
     */
    /**
     * @cfg {Number} growMin
     * Not applicable for Trigger.
     */
    /**
     * @cfg {Number} growMax
     * Not applicable for Trigger.
     */
});
