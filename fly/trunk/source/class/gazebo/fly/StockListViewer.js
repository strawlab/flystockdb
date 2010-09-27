/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/**
 * A class for viewing stocks.
 */
qx.Class.define("gazebo.fly.StockListViewer",
{
  extend : qx.ui.table.Table,

  construct : function()
  {
    this.base(arguments);

    this.setTableModel(new gazebo.fly.StockListModel());
  },

  members:
  {
  }
});