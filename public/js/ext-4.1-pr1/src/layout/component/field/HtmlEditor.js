/**
 * @private
 * @class Ext.layout.component.field.HtmlEditor
 * Layout class for {@link Ext.form.field.HtmlEditor} fields. Sizes the toolbar, textarea, and iframe elements.
 * @private
 */

Ext.define('Ext.layout.component.field.HtmlEditor', {
    extend: 'Ext.layout.component.field.Field',
    alias: ['layout.htmleditor'],

    type: 'htmleditor',

    // Flags to say that the item is autoheighting itself based upon a managed width.
    // This Component's component layout explicitly manages the toolbar's width.
    toolbarSizePolicy: {
        setsWidth: 1,
        setsHeight: 0
    },

    calculateBodyNaturalWidth: function() {
        return 565;
    },

    getItemSizePolicy: function (item) {
        // we are only ever called by the toolbar
        return this.toolbarSizePolicy;
    },

    getLayoutItems: function () {
        return [ this.owner.getToolbar() ];
    },

    getRenderTarget: function() {
        return this.owner.bodyEl;
    },

    sizeBodyContents: function(width, height, ownerContext) {
        var me = this,
            owner = me.owner,
            bodyContext = ownerContext.getEl('bodyEl'),
            toolbar = owner.getToolbar(),
            toolbarContext = ownerContext.context.getCmp(toolbar),
            toolbarHeight,
            textareaContext = ownerContext.getEl('textareaEl'),
            iframe = owner.iframeEl,
            iframeContext = ownerContext.getEl('iframeEl'),
            editorHeight;

        if (Ext.isNumber(width)) {
            width -= bodyContext.getFrameInfo().width;
        }
        toolbarContext.setWidth(width);
        textareaContext.setWidth(width);
        iframeContext.setWidth(width);

        // If fixed height, subtract toolbar height from the input area height
        // If the Toolbar has not acheieved a height yest, we are not done laying out.
        if (Ext.isNumber(height)) {
            toolbarHeight = toolbarContext.getProp('height');
            if (toolbarHeight) {
                editorHeight = height - toolbarHeight - bodyContext.getFrameInfo().height;
                textareaContext.setHeight(editorHeight);
                iframeContext.setHeight(editorHeight);
            }
            else {
                me.done = false;
            }
        }
    }
});