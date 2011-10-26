/**
 * @class Ext.layout.component.field.BoxLabelField
 * @extends Ext.layout.component.field.Field
 * Layout class for components with fields that have boxLabel elements (checkbox and radio).
 * @private
 */
Ext.define('Ext.layout.component.field.BoxLabelField', {

    /* Begin Definitions */

    alias: 'layout.boxlabelfield',

    extend: 'Ext.layout.component.field.Field',

    /* End Definitions */

    type: 'boxlabelfield',

    beginLayout: function (ownerContext) {
        this.callParent(arguments);

        ownerContext.boxLabelContext = ownerContext.getEl('boxLabelEl');
    },

    calculateBodyNaturalWidth: function (ownerContext) {
        var boxLabelEl = this.owner.boxLabelEl,
            width = this.callParent(arguments);

        if (boxLabelEl) {
            width += boxLabelEl.getWidth() + ownerContext.boxLabelContext.getMarginInfo().width;
        }

        return width;
    }
});
