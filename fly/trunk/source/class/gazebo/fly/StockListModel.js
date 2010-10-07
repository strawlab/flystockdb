/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/**
 * A class for viewing stocks.
 */
qx.Class.define("gazebo.fly.StockListModel",
{
  extend : qx.ui.table.model.Remote,

  construct : function()
  {
    this.base(arguments);

    this.setColumns([
        "Internal Stock-ID",
        "Genotype",
        "External Stock-ID",
        "Source / Donor",
        "Descriptions, Annotations and Notes",
        "Entered By",
        "Groups"
      ], [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6"
      ]);
  },

  members:
  {
    _loadRowCount : function()
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(5000); // 5sec time-out, arbitrarily chosen.
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      var that = this;
      this.rpcRunning = rpc.callAsync(
        function(result, ex, id)
        {
          if (result && result.length > 0) {
            that.debug("load count..");
            that._onRowCountLoaded(result[0][0]);
          }
        },
        "query",
        { count : true },
        "FB2010_05",
        [ '*' ],
        [ "x_stocks s" ],
        "true",
        [ ]
      );
      // id , xref, genotype, comment text, note text, source text, creator int)
    },

    _loadRowData : function(firstRow, lastRow)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(5000); // 5sec time-out, arbitrarily chosen.
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      this.debug("requested: " + firstRow + " to " + lastRow);
        
      var that = this;
      this.rpcRunning = rpc.callAsync(
        function(result, ex, id)
        {
          that.debug("load data..");
          if (result) {
            that.debug("result = " + result);
            var resultList = new Array();
            for (i = 0; i < result.length; i++) {
              var rowHash = {};
              for (j = 0; j < result[i].length; j++) {
                that.debug('i: ' + i + ' j: ' + j + ' = ' + result[i][j]);
                rowHash[j + ''] = result[i][j];
              }
              resultList.push(rowHash);
            }
            that._onRowDataLoaded(resultList);
          }
        },
        "query",
        {},
        "FB2010_05",
        [ '*' ],
        [ "x_stocks s" ],
        "true",
        [ ]
      );
    }
  }
});