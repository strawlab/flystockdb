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

  properties :
  {
    appearance :
    {
      refine : true,
      init   : "fauxgroupbox"
    },


    legendPosition :
    {
      check     : ["top", "middle"],
      init      : "middle",
      apply     : "_applyLegendPosition",
      themeable : true
    }
  }

});
