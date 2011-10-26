/**
 * Layout class for components with {@link Ext.form.Labelable field labeling}, handling the sizing and alignment of
 * the form control, label, and error message treatment.
 * @private
 */
Ext.define('Ext.layout.component.field.Field', {

    /* Begin Definitions */

    alias: ['layout.field'],

    extend: 'Ext.layout.component.Component',

    uses: ['Ext.tip.QuickTip', 'Ext.util.TextMetrics'],

    /* End Definitions */

    type: 'field',

    beforeLayout: function(width, height) {
        var me = this;
        return me.callParent(arguments) || (!me.owner.preventMark && me.activeError !== me.owner.getActiveError());
    },

    beginLayout: function(ownerContext) {
        var me = this,
            owner = me.owner;

        me.callParent(arguments);

        // Ensure that during a layout there is ample space to measure a naturally laid out body width.
        owner.bodyEl.setStyle('width', '1000em');

        ownerContext.labelStrategy = me.getLabelStrategy();
        ownerContext.errorStrategy = me.getErrorStrategy();

        ownerContext.bodyContext = ownerContext.getEl('bodyEl');
        ownerContext.labelContext = ownerContext.getEl('labelEl');
        ownerContext.inputContext = ownerContext.getEl('inputEl');
        ownerContext.errorContext = ownerContext.getEl('errorEl');

        // perform preparation on the label and error (setting css classes, qtips, etc.)
        ownerContext.labelStrategy.prepare(ownerContext, owner);
        ownerContext.errorStrategy.prepare(ownerContext, owner);
    },

    calculate: function(ownerContext) {
        var me = this,
            owner = me.owner,
            labelStrategy = me.getLabelStrategy(),
            errorStrategy = me.getErrorStrategy(),
            autoWidth = ownerContext.autoWidth,
            bodyContext = ownerContext.bodyContext,
            size = {},
            height, width;

        if (autoWidth) {
            size.width = me.getBodyNaturalWidth(ownerContext);
            ownerContext.setWidth(size.width);
            // TODO - CheckBoxGroup?
        } else {
            size.width = ownerContext.getProp('width');

            // Cannot lay out before width is published.
            if (!size.width) {
                me.done = false;
                return;
            }
        }

        // insets for the bodyEl from each side of the component layout area
        // Insets gets calculated each time by running through the strategies below, so must zero them each time.
        ownerContext.insets = { top: 0, right: 0, bottom: 0, left: 0 };

        // NOTE the order of calculating insets and setting styles here is very important; we must first
        // calculate and set horizontal layout alone, as the horizontal sizing of elements can have an impact
        // on the vertical sizes due to wrapping, then calculate and set the vertical layout.

        // calculate the horizontal insets for the label and error
        labelStrategy.adjustHorizInsets(ownerContext, owner, size);
        errorStrategy.adjustHorizInsets(ownerContext, owner, size);

        // set horizontal styles for label and error based on the current insets
        labelStrategy.layoutHoriz(ownerContext, owner, size);
        errorStrategy.layoutHoriz(ownerContext, owner, size);

        width = size.width - ownerContext.insets.left - ownerContext.insets.right,
        bodyContext.setWidth(width);

        if (ownerContext.bodyContext.hasDomProp('width')) {
            if (ownerContext.autoHeight) {
                if (ownerContext.hasRawContent) {
                    size.height = owner.el.getHeight();
                } else {
                    size.height = ownerContext.getProp('contentHeight') + ownerContext.getPaddingInfo().height + ownerContext.getBorderInfo().height;
                }
                ownerContext.setProp('height', size.height, false);
            } else {
                size.height = ownerContext.getProp('height');
            }

            // calculate the vertical insets for the label and error
            labelStrategy.adjustVertInsets(ownerContext, owner, size);
            errorStrategy.adjustVertInsets(ownerContext, owner, size);

            // set vertical styles for label and error based on the current insets
            labelStrategy.layoutVert(ownerContext, owner, size);
            errorStrategy.layoutVert(ownerContext, owner, size);

            if (Ext.isNumber(size.height)) {
                height = ownerContext.autoHeight ? null : size.height - ownerContext.insets.top - ownerContext.insets.bottom;
                bodyContext.setHeight(height);
            } else {
                me.done = false;
            }
        } else {
            me.done = false;
        }

        // Ensure inner elements are always synched so that wrapping never happens on a flush which shortens the width
        me.sizeBodyContents(width, height, ownerContext);
        me.activeError = owner.getActiveError();
    },
    
    onFocus: function(){
        this.getErrorStrategy().onFocus(this.owner);    
    },


    /*
     * @private
     * Perform sizing and alignment of the bodyEl (and children) to match the calculated insets.
     */
    /*sizeBody: function(ownerContext, size) {
        var bodyContext = ownerContext.getEl('bodyEl'),
            insets = ownerContext.insets,
            totalWidth = size.width,
            totalHeight = size.height,
            width = Ext.isNumber(totalWidth) ? totalWidth - insets.left - insets.right : totalWidth,
            height = ownerContext.autoHeight ? null : Ext.isNumber(totalHeight) ? totalHeight - insets.top - insets.bottom : totalHeight;

        // size the bodyEl
        bodyContext.setSize(width, height);

        // size the bodyEl's inner contents if necessary
        this.sizeBodyContents(width, height, ownerContext);
    },*/

    /**
     * @private
     * Size the contents of the field body, given the full dimensions of the bodyEl. Does nothing by
     * default, subclasses can override to handle their specific contents.
     * @param {Number} width The bodyEl width
     * @param {Number} height The bodyEl height
     * @param {Ext.layout.ContextItem} ownerContext The context of the owner component.
     */
    sizeBodyContents: Ext.emptyFn,

    getBodyNaturalWidth: function (ownerContext) {
        // store this value in "state" since those values are dropped by invalidate
        var state = ownerContext.state,
            width = state.bodyNaturalWidth ||
                   (state.bodyNaturalWidth = Math.ceil(this.calculateBodyNaturalWidth(ownerContext)));

        return width;
    },

    calculateBodyNaturalWidth: function (ownerContext) {
        var owner = this.owner,
            labelEl = owner.labelEl,
            width = owner.size ? (owner.size * 6.5 + 20) :  owner.inputEl.getWidth() +
                    ownerContext.inputContext.getMarginInfo().width;

        if (labelEl) {
            width += labelEl.getWidth() + ownerContext.labelContext.getMarginInfo().width;
        }

        return width;
    },

    /**
     * Return the set of strategy functions from the {@link #labelStrategies labelStrategies collection}
     * that is appropriate for the field's {@link Ext.form.Labelable#labelAlign labelAlign} config.
     */
    getLabelStrategy: function() {
        var me = this,
            strategies = me.labelStrategies,
            labelAlign = me.owner.labelAlign;
        return strategies[labelAlign] || strategies.base;
    },

    /**
     * Return the set of strategy functions from the {@link #errorStrategies errorStrategies collection}
     * that is appropriate for the field's {@link Ext.form.Labelable#msgTarget msgTarget} config.
     */
    getErrorStrategy: function() {
        var me = this,
            owner = me.owner,
            strategies = me.errorStrategies,
            msgTarget = owner.msgTarget;
        return !owner.preventMark && Ext.isString(msgTarget) ?
                (strategies[msgTarget] || strategies.elementId) :
                strategies.none;
    },

    /**
     * Collection of named strategies for laying out and adjusting labels to accommodate error messages.
     * An appropriate one will be chosen based on the owner field's {@link Ext.form.Labelable#labelAlign} config.
     */
    labelStrategies: (function() {
        var applyIf = Ext.applyIf,
            emptyFn = Ext.emptyFn,

            base = {
                prepare: function(ownerContext, owner) {
                    var cls = owner.labelCls + '-' + owner.labelAlign,
                        labelEl = owner.labelEl;

                    // Queue the addition of the label alignment class
                    if (labelEl && !labelEl.hasCls(cls)) {
                        labelEl.addCls(cls);
                    }
                },

                adjustHorizInsets: emptyFn,
                adjustVertInsets: emptyFn,
                layoutHoriz: emptyFn,
                layoutVert: emptyFn
            },

            left = applyIf({
                prepare: function(ownerContext) {
                    base.prepare.apply(this, arguments);

                    // Must set outer width to prevent field from wrapping below floated label
                    if (ownerContext.widthAuthority === 0) {
                        ownerContext.widthAuthority = 1;
                    }
                },
                adjustHorizInsets: function(ownerContext, owner, size) {
                    if (owner.labelEl) {
                        ownerContext.insets.left += owner.labelWidth + owner.labelPad;
                    }
                },
                layoutHoriz: function(ownerContext, owner) {
                    // For content-box browsers we can't rely on Labelable.js#getLabelableRenderData
                    // setting the width style because it needs to account for the final calculated
                    // padding/border styles for the label. So we set the width programmatically here to
                    // normalize content-box sizing, while letting border-box browsers use the original
                    // width style.
                    if (owner.labelEl && !owner.isLabelSized && !Ext.isBorderBox) {
                        ownerContext.labelContext.setWidth(owner.labelWidth);
                        owner.isLabelSized = true;
                    }
                }
            }, base);


        return {
            base: base,

            /**
             * Label displayed above the bodyEl
             */
            top: applyIf({
                adjustVertInsets: function(ownerContext, owner) {
                    var labelEl = owner.labelEl;
                    if (labelEl) {
                        ownerContext.insets.top += owner.bodyEl.getOffsetsTo(labelEl)[1];
                                                //owner.inputEl.getOffsetsTo(labelEl)[1];
                    }
                }
            }, base),

            /**
             * Label displayed to the left of the bodyEl
             */
            left: left,

            /**
             * Same as left, only difference is text-align in CSS
             */
            right: left
        };
    })(),

    /**
     * Collection of named strategies for laying out and adjusting insets to accommodate error messages.
     * An appropriate one will be chosen based on the owner field's {@link Ext.form.Labelable#msgTarget} config.
     */
    errorStrategies: (function() {
        function showTip(owner) {
            var tip = Ext.layout.component.field.Field.tip,
                target;
                
            if (tip && tip.isVisible()) {
                target = tip.activeTarget;
                if (target && target.el === owner.getActionEl().dom) {
                    tip.toFront(true);
                }
            }
        }

        var applyIf = Ext.applyIf,
            emptyFn = Ext.emptyFn,
            base = {
                prepare: function(ownerContext, owner) {
                    owner.errorEl.setDisplayed(false);
                },
                adjustHorizInsets: emptyFn,
                adjustVertInsets: emptyFn,
                layoutHoriz: emptyFn,
                layoutVert: emptyFn,
                onFocus: emptyFn
            };

        return {
            none: base,

            /**
             * Error displayed as icon (with QuickTip on hover) to right of the bodyEl
             */
            side: applyIf({
                prepare: function(ownerContext, owner) {
                    var errorEl = owner.errorEl;

                    errorEl.addCls(Ext.baseCSSPrefix + 'form-invalid-icon');
                    errorEl.set({'data-errorqtip': owner.getActiveError() || ''});
                    errorEl.setDisplayed(owner.hasActiveError());

                    // TODO: defer the tip call until after the layout to avoid immediate DOM reads now
                    Ext.layout.component.field.Field.initTip();
                },
                adjustHorizInsets: function(ownerContext, owner) {
                    if (owner.autoFitErrors && owner.hasActiveError()) {
                        ownerContext.insets.right += owner.errorEl.getWidth();
                    }
                },
                layoutHoriz: function(ownerContext, owner, size) {
                    if (owner.hasActiveError()) {
                        ownerContext.errorContext.setProp('x', size.width - ownerContext.insets.right);
                    }
                },
                layoutVert: function(ownerContext, owner) {
                    if (owner.hasActiveError()) {
                        ownerContext.errorContext.setProp('y', ownerContext.insets.top);
                    }
                },
                onFocus: showTip
            }, base),

            /**
             * Error message displayed underneath the bodyEl
             */
            under: applyIf({
                prepare: function(ownerContext, owner) {
                    var errorEl = owner.errorEl,
                        cls = Ext.baseCSSPrefix + 'form-invalid-under';

                    errorEl.addCls(cls);
                    errorEl.setDisplayed(owner.hasActiveError());
                },
                adjustVertInsets: function(ownerContext, owner) {
                    if (owner.autoFitErrors) {
                        ownerContext.insets.bottom += owner.errorEl.getHeight();
                    }
                },
                layoutHoriz: function(ownerContext, owner, size) {
                    var errorContext = ownerContext.errorContext,
                        insets = ownerContext.insets;

                    errorContext.setProp('width', size.width - insets.right - insets.left + 'px');
                    errorContext.setProp('margin-left', insets.left);
                }
            }, base),

            /**
             * Error displayed as QuickTip on hover of the field container
             */
            qtip: applyIf({
                prepare: function(ownerContext, owner) {
                    owner.errorEl.setDisplayed(false);
                    Ext.layout.component.field.Field.initTip();
                    owner.getActionEl().set({'data-errorqtip': owner.getActiveError() || ''});
                },
                onFocus: showTip
            }, base),

            /**
             * Error displayed as title tip on hover of the field container
             */
            title: applyIf({
                prepare: function(ownerContext, owner) {
                    owner.errorEl.setDisplayed(owner.errorEl, false);
                    owner.el.set({'title': owner.getActiveError() || ''});
                }
            }, base),

            /**
             * Error message displayed as content of an element with a given id elsewhere in the app
             */
            elementId: applyIf({
                prepare: function(ownerContext, owner) {
                    owner.errorEl.setDisplayed(false);
                    var targetEl = Ext.fly(owner.msgTarget);
                    if (targetEl) {
                        targetEl.dom.innerHTML = owner.getActiveError() || '';
                        targetEl.setDisplayed(owner.hasActiveError());
                    }
                }
            }, base)
        };
    })(),

    statics: {
        /**
         * Use a custom QuickTip instance separate from the main QuickTips singleton, so that we
         * can give it a custom frame style. Responds to errorqtip rather than the qtip property.
         * @static
         */
        initTip: function() {
            var tip = this.tip;
            if (!tip) {
                tip = this.tip = Ext.create('Ext.tip.QuickTip', {
                    baseCls: Ext.baseCSSPrefix + 'form-invalid-tip'
                });
                tip.tagConfig = Ext.apply({}, {attribute: 'errorqtip'}, tip.tagConfig);
            }
        },

        /**
         * Destroy the error tip instance.
         * @static
         */
        destroyTip: function() {
            var tip = this.tip;
            if (tip) {
                tip.destroy();
                delete this.tip;
            }
        }
    }
});
