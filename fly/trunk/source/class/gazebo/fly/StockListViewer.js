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

  construct : function(parameters, listeners, overrides)
  {
    this.base(arguments);

    this.setMinWidth(1000);
    this.setMaxWidth(1000);

    var searchTerm = parameters['searchTerm'];
    var searchChromosomeX = parameters['searchChromosome0'];
    var searchChromosome2 = parameters['searchChromosome1'];
    var searchChromosome3 = parameters['searchChromosome2'];
    var searchChromosome4 = parameters['searchChromosome3'];
    var searchChromosomeY = parameters['searchChromosome4'];
    var searchChromosomeU = parameters['searchChromosome5'];
    
    var model = new gazebo.fly.StockListModel(parameters)
    this.setTableModel(model);

    var tableColumnModel = this.getTableColumnModel();

    // Edit-/view-buttons:
    tableColumnModel.setDataCellRenderer(0, new qx.ui.table.cellrenderer.Image(16, 16));

    // TODO HACK Chr search becomes term search for highlighting..
    if (!searchTerm) {
      searchTerm = '';
      searchTerm += searchChromosomeX ? searchChromosomeX : '';
      searchTerm += searchChromosome2 ? searchChromosome2 : '';
      searchTerm += searchChromosome3 ? searchChromosome3 : '';
      searchTerm += searchChromosome4 ? searchChromosome4 : '';
      searchTerm += searchChromosomeY ? searchChromosomeY : '';
      searchTerm += searchChromosomeU ? searchChromosomeU : '';

      if (searchTerm.length > 0) {
        tableColumnModel.setDataCellRenderer(3, new gazebo.fly.StockListModelRenderer(searchTerm));
      }
    } else {

      // TODO Proper implementation if a search term is present..

      // Column 0 contains the edit-/view-buttons.
      for (var i = 1; i < model.getColumnCount(); i++) {
        // Search terms only apply to internal st.-id, gt, wt, descr., ext-id.
        if (searchTerm && (i < 7 || i == 8)) {
          tableColumnModel.setDataCellRenderer(i, new gazebo.fly.StockListModelRenderer(searchTerm));
        }
      }

    }

    this.setColumnWidth(0, 28); // Centered 16x16 icon.

    // Install custom listeners:
    if (listeners['onStockSelect']) {
      var listener = listeners['onStockSelect'];
      var that = this;
      this.addListener('onStockSelectRelay', listener['call'], listener['context']);
      this.addListener('cellClick', function(cellEvent) {
            if (cellEvent.getColumn() == 0) {
              this.fireDataEvent('onStockSelectRelay', that.getTableModel().getValue(1, cellEvent.getRow()));
            }
          },
          this
        );
    }
  },

  members:
  {
  }
});