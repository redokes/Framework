/**
 * The FocusManager is responsible for globally:
 *
 * 1. Managing component focus
 * 2. Providing basic keyboard navigation
 * 3. (optional) Provide a visual cue for focused components, in the form of a focus ring/frame.
 *
 * To activate the FocusManager, simply call `Ext.focus.FocusManager.enable();`. In turn, you may
 * deactivate the FocusManager by subsequently calling `Ext.focus.FocusManager.disable();`.  The
 * FocusManager is disabled by default.
 *
 * To enable the optional focus frame, pass `true` or `{focusFrame: true}` to {@link #enable}.
 *
 * Another feature of the FocusManager is to provide basic keyboard focus navigation scoped to any {@link Ext.container.Container}
 * that would like to have navigation between its child {@link Ext.Component}'s. The {@link Ext.container.Container} can simply
 * call {@link #subscribe Ext.focus.FocusManager.subscribe} to take advantage of this feature, and can at any time call
 * {@link #unsubscribe Ext.focus.FocusManager.unsubscribe} to turn the navigation off.
 *
 * @singleton
 * @author Jarred Nicholls <jarred@sencha.com>
 * @docauthor Jarred Nicholls <jarred@sencha.com>
 */
Ext.define('Ext.focus.FocusManager', {
    singleton: true,
    alternateClassName: ['Ext.FocusMgr', 'Ext.FocusManager'],

    mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: [
        'Ext.AbstractComponent',
        'Ext.ComponentManager',
        'Ext.ComponentQuery',
        'Ext.util.HashMap',
        'Ext.util.KeyNav'
    ],

    /**
     * @property {Boolean} enabled
     * Whether or not the FocusManager is currently enabled
     */
    enabled: false,

    /**
     * @property {Ext.Component} focusedCmp
     * The currently focused component.
     */

    focusElementCls: Ext.baseCSSPrefix + 'focus-element',

    focusFrameCls: Ext.baseCSSPrefix + 'focus-frame',

    /**
     * @property {String[]} whitelist
     * A list of xtypes that should ignore certain navigation input keys and
     * allow for the default browser event/behavior. These input keys include:
     *
     * 1. Backspace
     * 2. Delete
     * 3. Left
     * 4. Right
     * 5. Up
     * 6. Down
     *
     * The FocusManager will not attempt to navigate when a component is an xtype (or descendents thereof)
     * that belongs to this whitelist. E.g., an {@link Ext.form.field.Text} should allow
     * the user to move the input cursor left and right, and to delete characters, etc.
     */
    whitelist: [
        'textfield'
    ],

    /**
     * @private
     * A list of tagNames which do not need a tabIndex attribute set to be able to receive focus. Component's focusEls,
     * when they are tagNames other than these, get a tabIndex of -1 poked into them.
     * If given a value of "-1", the element can't be tabbed to but focus can be given to the element programmatically (using element.focus()).
     * See http://snook.ca/archives/accessibility_and_usability/elements_focusable_with_tabindex
     */
    tabIndexWhitelist: [
        'a',
        'button',
        'embed',
        'frame',
        'iframe',
        'img',
        'input',
        'object',
        'select',
        'textarea'
    ],

    needsTabIndex: function(n) {
        var dom = Ext.getDom(n);

        // If the element is not naturally focusable, and its tabIndex <= 0 (An unspecififed tabIndex returns the value -1), then it needs a tabIndex to make it focusable.
        return dom.tagName && !Ext.Array.contains(this.tabIndexWhitelist, dom.tagName.toLowerCase())
            && dom.tabIndex <= 0;
    },

    constructor: function() {
        var me = this,
            CQ = Ext.ComponentQuery;

        me.addEvents(
            /**
             * @event beforecomponentfocus
             * Fires before a component becomes focused. Return `false` to prevent
             * the component from gaining focus.
             * @param {Ext.focus.FocusManager} fm A reference to the FocusManager singleton
             * @param {Ext.Component} cmp The component that is being focused
             * @param {Ext.Component} previousCmp The component that was previously focused,
             * or `undefined` if there was no previously focused component.
             */
            'beforecomponentfocus',

            /**
             * @event componentfocus
             * Fires after a component becomes focused.
             * @param {Ext.focus.FocusManager} fm A reference to the FocusManager singleton
             * @param {Ext.Component} cmp The component that has been focused
             * @param {Ext.Component} previousCmp The component that was previously focused,
             * or `undefined` if there was no previously focused component.
             */
            'componentfocus',

            /**
             * @event disable
             * Fires when the FocusManager is disabled
             * @param {Ext.focus.FocusManager} fm A reference to the FocusManager singleton
             */
            'disable',

            /**
             * @event enable
             * Fires when the FocusManager is enabled
             * @param {Ext.focus.FocusManager} fm A reference to the FocusManager singleton
             */
            'enable'
        );

        // Buffer focus handling so components can do a layout/positioning
        // and give us an ability to buffer focuses
        me.self.prototype.handleComponentFocus = Ext.Function.createBuffered(me.self.prototype.handleComponentFocus, 10);


        // Gain control on Component focus, blur, hide and destroy
        Ext.override(Ext.AbstractComponent, {
            onFocus: function() {
                this.callOverridden(arguments);
                if (me.enabled && this.hasFocus) {
                    Array.prototype.unshift.call(arguments, this);
                    me.onComponentFocus.apply(me, arguments);
                }
            },
            onBlur: function() {
                this.callOverridden(arguments);
                if (me.enabled && !this.hasFocus) {
                    Array.prototype.unshift.call(arguments, this);
                    me.onComponentBlur.apply(me, arguments);
                }
            },
            afterHide: function() {
                this.callOverridden(arguments);
                if (me.enabled) {
                    Array.prototype.unshift.call(arguments, this);
                    me.onComponentHide.apply(me, arguments);
                }
            },
            onDestroy: function() {
                this.callOverridden(arguments);
                if (me.enabled) {
                    Array.prototype.unshift.call(arguments, this);
                    me.onComponentDestroy.apply(me, arguments);
                }
            }
        });
        // Setup KeyNav that's bound to document to catch all
        // unhandled/bubbled key events for navigation
        me.keyNav = new Ext.util.KeyNav(Ext.getDoc(), {
            disabled: true,
            scope: me,

            backspace: me.focusLast,
            enter: me.navigateIn,
            esc: me.navigateOut,
            tab: me.navigateSiblings

            //space: me.navigateIn,
            //del: me.focusLast,
            //left: me.navigateSiblings,
            //right: me.navigateSiblings,
            //down: me.navigateSiblings,
            //up: me.navigateSiblings
        });

        me.focusData = {};
        me.subscribers = new Ext.util.HashMap();
        me.focusChain = {};

        // Setup some ComponentQuery pseudos
        Ext.apply(CQ.pseudos, {
            focusable: function(cmps) {
                var len = cmps.length,
                    results = [],
                    i = 0,
                    c;

                for (; i < len; i++) {
                    c = cmps[i];
                    if (c.isFocusable()) {
                        results.push(c);
                    }
                }

                return results;
            },

            nextFocus: function(cmps, idx, step) {
                step = step || 1;
                idx = parseInt(idx, 10);

                var len = cmps.length,
                    i = idx + step,
                    c;

                for (; i != idx; i += step) {
                    if (i >= len) {
                        i = 0;
                    } else if (i < 0) {
                        i = len - 1;
                    }

                    c = cmps[i];
                    if (c.isFocusable()) {
                        return [c];
                    } else if (c.placeholder && c.placeholder.isFocusable()) {
                        return [c.placeholder];
                    }
                }

                return [];
            },

            prevFocus: function(cmps, idx) {
                return this.nextFocus(cmps, idx, -1);
            },

            root: function(cmps) {
                var len = cmps.length,
                    results = [],
                    i = 0,
                    c;

                for (; i < len; i++) {
                    c = cmps[i];
                    if (!c.ownerCt) {
                        results.push(c);
                    }
                }

                return results;
            }
        });
    },

    /**
     * Adds the specified xtype to the {@link #whitelist}.
     * @param {String/String[]} xtype Adds the xtype(s) to the {@link #whitelist}.
     */
    addXTypeToWhitelist: function(xtype) {
        var me = this;

        if (Ext.isArray(xtype)) {
            Ext.Array.forEach(xtype, me.addXTypeToWhitelist, me);
            return;
        }

        if (!Ext.Array.contains(me.whitelist, xtype)) {
            me.whitelist.push(xtype);
        }
    },

    clearComponent: function(cmp) {
        clearTimeout(this.cmpFocusDelay);
        if (!cmp.isDestroyed) {
            cmp.blur();
        }
    },

    /**
     * Disables the FocusManager by turning of all automatic focus management and keyboard navigation
     */
    disable: function() {
        var me = this;

        if (!me.enabled) {
            return;
        }

        delete me.options;
        me.enabled = false;

        me.removeDOM();

        // Stop handling key navigation
        me.keyNav.disable();

        me.fireEvent('disable', me);
    },

    /**
     * Enables the FocusManager by turning on all automatic focus management and keyboard navigation
     * @param {Boolean/Object} options Either `true`/`false` to turn on the focus frame, or an object
     * with the following options:
     *
     * - focusFrame : Boolean
     *   `true` to show the focus frame around a component when it is focused. Defaults to `false`.
     */
    enable: function(options) {
        var me = this;

        if (options === true) {
            options = { focusFrame: true };
        }
        me.options = options = options || {};

        if (me.enabled) {
            return;
        }

        me.initDOM(options);

        // Start handling key navigation
        me.keyNav.enable();

        // Finally, let's focus our global focus el so we start fresh
        me.focusEl.focus();
        delete me.focusedCmp;

        me.enabled = true;
        me.fireEvent('enable', me);
    },

    focusLast: function(e) {
        var me = this;

        if (me.isWhitelisted(me.focusedCmp)) {
            return true;
        }

        // Go back to last focused item
        if (me.previousFocusedCmp) {
            me.previousFocusedCmp.focus();
        }
    },

    getRootComponents: function() {
        var me = this,
            CQ = Ext.ComponentQuery,
            inline = CQ.query(':focusable:root:not([floating])'),
            floating = CQ.query(':focusable:root[floating]');

        // Floating items should go to the top of our root stack, and be ordered
        // by their z-index (highest first)
        floating.sort(function(a, b) {
            return a.el.getZIndex() > b.el.getZIndex();
        });

        return floating.concat(inline);
    },

    initDOM: function(options) {
        var me = this,
            sp = '&#160',
            cls = me.focusFrameCls;

        if (!Ext.isReady) {
            Ext.onReady(me.initDOM, me);
            return;
        }

        // Create global focus element
        if (!me.focusEl) {
            me.focusEl = Ext.getBody().createChild({
                tabIndex: '-1',
                cls: me.focusElementCls,
                html: sp
            });
        }

        // Create global focus frame
        if (!me.focusFrame && options.focusFrame) {
            me.focusFrame = Ext.getBody().createChild({
                cls: cls,
                children: [
                    { cls: cls + '-top' },
                    { cls: cls + '-bottom' },
                    { cls: cls + '-left' },
                    { cls: cls + '-right' }
                ],
                style: 'top: -100px; left: -100px;'
            });
            me.focusFrame.setVisibilityMode(Ext.Element.DISPLAY);
            me.focusFrameWidth = me.focusFrame.child('.' + cls + '-top').getHeight();
            me.focusFrame.hide().setLeftTop(0, 0);
        }
    },

    isWhitelisted: function(cmp) {
        return cmp && Ext.Array.some(this.whitelist, function(x) {
            return cmp.isXType(x);
        });
    },

    navigateIn: function(e) {
        var me = this,
            focusedCmp = me.focusedCmp,
            rootCmps,
            firstChild;

        if (!focusedCmp) {
            // No focus yet, so focus the first root cmp on the page
            rootCmps = me.getRootComponents();
            if (rootCmps.length) {
                rootCmps[0].focus();
            }
        } else {
            // Drill into child ref items of the focused cmp, if applicable.
            // This works for any Component with a getRefItems implementation.
            firstChild = Ext.ComponentQuery.query('>:focusable', focusedCmp)[0];
            if (firstChild) {
                firstChild.focus();
            } else {
                // Let's try to fire a click event, as if it came from the mouse
                if (Ext.isFunction(focusedCmp.onClick)) {
                    e.button = 0;
                    focusedCmp.onClick(e);
                    focusedCmp.focus();
                }
            }
        }
    },

    navigateOut: function(e) {
        var me = this,
            parent;

        if (!me.focusedCmp || !(parent = me.focusedCmp.up(':focusable'))) {
            me.focusEl.focus();
        } else {
            parent.focus();
        }

        // In some browsers (Chrome) FocusManager can handle this before other
        // handlers. Ext Windows have their own Esc key handling, so we need to
        // return true here to allow the event to bubble.
        return true;
    },

    navigateSiblings: function(e, source, parent) {
        var me = this,
            src = source || me,
            key = e.getKey(),
            EO = Ext.EventObject,
            goBack = e.shiftKey || key == EO.LEFT || key == EO.UP,
            checkWhitelist = key == EO.LEFT || key == EO.RIGHT || key == EO.UP || key == EO.DOWN,
            nextSelector = goBack ? 'prev' : 'next',
            idx, next, focusedCmp;

        focusedCmp = (src.focusedCmp && src.focusedCmp.comp) || src.focusedCmp;
        if (!focusedCmp && !parent) {
            return;
        }

        if (checkWhitelist && me.isWhitelisted(focusedCmp)) {
            return true;
        }

        parent = parent || focusedCmp.up();
        if (parent) {
            idx = focusedCmp ? Ext.Array.indexOf(parent.getRefItems(), focusedCmp) : -1;
            next = Ext.ComponentQuery.query('>:' + nextSelector + 'Focus(' + idx + ')', parent)[0];
            if (next && focusedCmp !== next) {
                next.focus();
                return next;
            }
        }
    },

    onComponentBlur: function(cmp, e) {
        var me = this;

        if (me.focusedCmp === cmp) {
            me.previousFocusedCmp = cmp;
            delete me.focusedCmp;
        }

        if (me.focusFrame) {
            me.focusFrame.hide();
        }
    },

    onComponentFocus: function(cmp, e) {
        var me = this,
            chain = me.focusChain;

        if (!cmp.isFocusable()) {
            me.clearComponent(cmp);

            // Check our focus chain, so we don't run into a never ending recursion
            // If we've attempted (unsuccessfully) to focus this component before,
            // then we're caught in a loop of child->parent->...->child and we
            // need to cut the loop off rather than feed into it.
            if (chain[cmp.id]) {
                return;
            }

            // Try to focus the parent instead
            var parent = cmp.up();
            if (parent) {
                // Add component to our focus chain to detect infinite focus loop
                // before we fire off an attempt to focus our parent.
                // See the comments above.
                chain[cmp.id] = true;
                parent.focus();
            }

            return;
        }

        // Clear our focus chain when we have a focusable component
        me.focusChain = {};
        me.handleComponentFocus.apply(me, arguments);
    },

    handleComponentFocus: function(cmp, e) {
        var me = this;

        if (me.fireEvent('beforecomponentfocus', me, cmp, me.previousFocusedCmp) === false) {
            me.clearComponent(cmp);
            return;
        }

        me.focusedCmp = cmp;

        // If we have a focus frame, show it around the focused component
        if (me.shouldShowFocusFrame(cmp)) {
            var cls = '.' + me.focusFrameCls + '-',
                ff = me.focusFrame,
                fw = me.focusFrameWidth,
                box = cmp.getFocusEl().getPageBox(),

            // Size the focus frame's t/b/l/r according to the box
            // This leaves a hole in the middle of the frame so user
            // interaction w/ the mouse can continue
                bt = box.top,
                bl = box.left,
                bw = box.width,
                bh = box.height,
                ft = ff.child(cls + 'top'),
                fb = ff.child(cls + 'bottom'),
                fl = ff.child(cls + 'left'),
                fr = ff.child(cls + 'right');

            ft.setWidth(bw - 2).setLeftTop(bl + 1, bt);
            fb.setWidth(bw - 2).setLeftTop(bl + 1, bt + bh - fw);
            fl.setHeight(bh - 2).setLeftTop(bl, bt + 1);
            fr.setHeight(bh - 2).setLeftTop(bl + bw - fw, bt + 1);

            ff.show();
        }

        me.fireEvent('componentfocus', me, cmp, me.previousFocusedCmp);
    },

    onComponentHide: function(cmp) {
        var me = this,
            cmpHadFocus = false,
            focusedCmp,
            parent;

        if (me.focusedCmp) {
            // See if the Component being hidden was the focused Component, or owns the focused Component
            // In these cases, focus needs to be removed from the focused Component to the nearest focusable ancestor
            cmpHadFocus = (cmp === me.focusedCmp) || (cmp.isContainer && cmp.isAncestor(me.focusedCmp));

            if (focusedCmp) {
                me.clearComponent(focusedCmp);
            }
        }

        me.clearComponent(cmp);

        // Move focus onto the nearest focusable ancestor
        if (cmpHadFocus) {
            parent = cmp.up(':focusable');
            if (parent) {
                parent.focus();
            }
        }
    },

    onComponentDestroy: function() {
        
    },

    removeDOM: function() {
        var me = this;

        // If we are still enabled globally, or there are still subscribers
        // then we will halt here, since our DOM stuff is still being used
        if (me.enabled || me.subscribers.length) {
            return;
        }

        Ext.destroy(
            me.focusEl,
            me.focusFrame
        );
        delete me.focusEl;
        delete me.focusFrame;
        delete me.focusFrameWidth;
    },

    /**
     * Removes the specified xtype from the {@link #whitelist}.
     * @param {String/String[]} xtype Removes the xtype(s) from the {@link #whitelist}.
     */
    removeXTypeFromWhitelist: function(xtype) {
        var me = this;

        if (Ext.isArray(xtype)) {
            Ext.Array.forEach(xtype, me.removeXTypeFromWhitelist, me);
            return;
        }

        Ext.Array.remove(me.whitelist, xtype);
    },

    setupSubscriberKeys: function(container, keys) {
        var me = this,
            el = container.getFocusEl(),
            scope = keys.scope,
            handlers = {
                backspace: me.focusLast,
                enter: me.navigateIn,
                esc: me.navigateOut,
                scope: me
            },

            navSiblings = function(e) {
                if (me.focusedCmp === container) {
                    // Root the sibling navigation to this container, so that we
                    // can automatically dive into the container, rather than forcing
                    // the user to hit the enter key to dive in.
                    return me.navigateSiblings(e, me, container);
                } else {
                    return me.navigateSiblings(e);
                }
            };

        Ext.iterate(keys, function(key, cb) {
            handlers[key] = function(e) {
                var ret = navSiblings(e);

                if (Ext.isFunction(cb) && cb.call(scope || container, e, ret) === true) {
                    return true;
                }

                return ret;
            };
        }, me);

        return new Ext.util.KeyNav(el, handlers);
    },

    shouldShowFocusFrame: function(cmp) {
        var me = this,
            opts = me.options || {},
            cmpFocusEl = cmp.getFocusEl(),
            cmpFocusElTag = Ext.getDom(cmpFocusEl).tagName;

        // Do not show a focus frame if
        // 1. We are configured not to.
        // 2. No Component was passed
        // 3. The Component's focusEl is naturally focusable
        if (!me.focusFrame || !cmp || (cmpFocusElTag && Ext.Array.contains(me.tabIndexWhitelist, cmpFocusElTag.toLowerCase()))) {
            return false;
        }

        // Global trumps
        if (opts.focusFrame) {
            return true;
        }

        if (me.focusData[cmp.id].focusFrame) {
            return true;
        }

        return false;
    }
});