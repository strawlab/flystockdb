/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/**
 * A groupbox without legend.
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
