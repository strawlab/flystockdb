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

  construct : function(parameters)
  {
    this.base(arguments);

    var searchTerm = parameters['searchTerm'];
    
    var model = new gazebo.fly.StockListModel(parameters)
    this.setTableModel(model);

    var tableColumnModel = this.getTableColumnModel();

    for (var i = 0; i < model.getColumnCount(); i++) {
      // Search terms only apply to internal st.-id, gt, wt, descr., ext-id.
      if (searchTerm && (i < 4 || i == 5)) {
        tableColumnModel.setDataCellRenderer(i, new gazebo.fly.StockListModelRenderer(searchTerm));
      }
    }
  },

  members:
  {
  }
});