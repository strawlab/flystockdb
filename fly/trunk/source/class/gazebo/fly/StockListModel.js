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

  construct : function(parameters)
  {
    this.base(arguments);

    this.setColumns([
        "Internal Stock-ID",
        "Vial- / Bottle-Label",
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
        "4",
        "3",
        "8",
        "5",
        "7",
        "2",
        "6",
        "11", // TODO "10" and "11" are hacks. See below.
        "12"
      ]);

    this.searchTerm = parameters['searchTerm'];

    this.searchChromosomeX = parameters['searchChromosome0'];
    this.searchChromosome2 = parameters['searchChromosome1'];
    this.searchChromosome3 = parameters['searchChromosome2'];
    this.searchChromosome4 = parameters['searchChromosome3'];
    this.searchChromosomeY = parameters['searchChromosome4'];
    this.searchChromosomeU = parameters['searchChromosome5'];
  },

  members:
  {
    generateQuery : function()
    {
      if (this.searchTerm) {
        return 's.id ~ ? OR s.xref ~ ? OR s.genotype ~ ? OR s.description ~ ? OR s.wildtype ~ ?';
      }

      // TODO HACK
      if (this.searchChromosomeX ||
        this.searchChromosome2 ||
        this.searchChromosome3 ||
        this.searchChromosome4 ||
        this.searchChromosomeY ||
        this.searchChromosomeU) {
        return 's.genotype ~ ?';
      }

      return 'true';
    },

    generateQueryArguments : function()
    {
      if (this.searchTerm) {
        return [
          '(^|\\W)' + this.searchTerm + '(\\W|$)',
          '(^|\\W)' + this.searchTerm + '(\\W|$)',
          '(^|\\W)' + this.searchTerm + '(\\W|$)',
          '(^|\\W)' + this.searchTerm + '(\\W|$)',
          '(^|\\W)' + this.searchTerm + '(\\W|$)'
        ];
      }

      // TODO HACK
      if (this.searchChromosomeX ||
        this.searchChromosome2 ||
        this.searchChromosome3 ||
        this.searchChromosome4 ||
        this.searchChromosomeY ||
        this.searchChromosomeU) {
        var searchTerm = '';

        searchTerm += this.searchChromosomeX ? this.searchChromosomeX : '';
        searchTerm += this.searchChromosome2 ? this.searchChromosome2 : '';
        searchTerm += this.searchChromosome3 ? this.searchChromosome3 : '';
        searchTerm += this.searchChromosome4 ? this.searchChromosome4 : '';
        searchTerm += this.searchChromosomeY ? this.searchChromosomeY : '';
        searchTerm += this.searchChromosomeU ? this.searchChromosomeU : '';

        return '(^|\\W)' + searchTerm + '(\\W|$)';
      }

      return [];
    },

    _loadRowCount : function()
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(gazebo.Application.delayedTimeout);
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
        this.generateQuery(),
        this.generateQueryArguments()
      );
    },

    _loadRowData : function(firstRow, lastRow)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(gazebo.Application.delayedTimeout);
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
              rowHash['' + (result[i].length + 1)] = result[i][7]
              resultList.push(rowHash);
            }
            that._onRowDataLoaded(resultList);
          }
        },
        "query_data",
        {},
        "FB2010_05",
        [ '*' ],
        [ "x_stocks s" ],
        this.generateQuery(),
        this.generateQueryArguments()
      );
    }
  }
});

qx.Class.define("gazebo.fly.StockListModelRenderer",
{
  extend : qx.ui.table.cellrenderer.Default,

  construct : function(searchTerm)
  {
    this.base(arguments);

    this.searchTerm = searchTerm;
  },

  members :
  {
    _getCellStyle : function(cellInfo)
    {
      var cellContents = cellInfo['value'];

      var re = new RegExp("(^|\\W)" + this.searchTerm + "(\\W|$)", "g");

      if (cellContents && ('' + cellContents).match(re)) {
        var color = (cellInfo.row % 2 == 1 ? "#abc7ed" : "#bee4ff");

        return this.base(arguments, cellInfo) + "background-color:" + color + ";";
      }

      return this.base(arguments, cellInfo);
    }
  }
});