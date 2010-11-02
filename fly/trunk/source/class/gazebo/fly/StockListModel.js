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
        "Wildtype Name",
        "Descriptions, Annotations and Notes",
        "Contact",
        "External Stock-ID",
        "Source / Donor",
        "Groups",
        "Entered By"
      ], [
        "0",
        "3",
        "7",
        "4",
        "6",
        "2",
        "5",
        "10", // TODO "10" and "11" are hacks. See below.
        "11"
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
            that._onRowCountLoaded(result[0][0]);
          }
        },
        "query_data",
        { count : true }, // NOTE: Count only works on *, but not on individual column names.
        "FB2010_05",
        [ '*' ],
        [ "x_stocks s" ],
        "true",
        [ ]
      );
    },

    _loadRowData : function(firstRow, lastRow)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(5000); // 5sec time-out, arbitrarily chosen.
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");
        
      var that = this;
      this.rpcRunning = rpc.callAsync(
        function(result, ex, id)
        {
          if (result) {
            var resultList = new Array();
            for (i = 0; i < result.length; i++) {
              var rowHash = {};
              for (j = 0; j < result[i].length; j++) {
                rowHash[j + ''] = result[i][j];
              }
              // TODO Temporary hack for now..
              rowHash[result[i].length + ''] = 'Public'
              rowHash['' + (result[i].length + 1)] = 'administrator'
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