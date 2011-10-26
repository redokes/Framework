/**
 * @class Ext.layout.component.Draw
 * @private
 *
 */

Ext.define('Ext.layout.component.Draw', {

    /* Begin Definitions */

    alias: 'layout.draw',

    extend: 'Ext.layout.component.Auto',

    /* End Definitions */

    type: 'draw',

    finishedLayout: function (ownerContext) {
        var props = ownerContext.props;

        // We don't want the cost of getProps, so we just use the props data... this is ok
        // because all the props have been calculated by this time

        this.owner.surface.setSize(props.width, props.height);

        // calls afterComponentLayout, so we want the surface to be sized before that:
        this.callParent(arguments);
    }
});
