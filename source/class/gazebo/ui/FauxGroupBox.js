/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Group boxes are used to group a set of form elements.
 *
 * @childControl frame {qx.ui.container.Composite} frame for the content widgets
 * @childControl legend {qx.ui.basic.Atom} legend to show at top of the groupbox
 */
qx.Class.define("gazebo.ui.FauxGroupBox",
{
  extend : qx.ui.groupbox.GroupBox,



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init   : "fauxgroupbox"
    },


    /**
     * Property for setting the position of the legend.
     */
    legendPosition :
    {
      check     : ["top", "middle"],
      init      : "middle",
      apply     : "_applyLegendPosition",
      themeable : true
    }
  }

});
