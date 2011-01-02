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
        "",
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
        "1",
        "5",
        "4",
        "9",
        "6",
        "8",
        "3",
        "7",
        "13", // TODO "13" and "14" are hacks. See below.
        "14"
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
        return 's.id == ? OR s.xref ~ ? OR s.genotype ~ ? OR s.description ~ ? OR s.wildtype ~ ?';
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
        var id = parseInt(this.searchTerm);

        if (isNaN(id)) {
          id = 0; // searchTerm is not a number, so pick '0', which is not a stock-id.
        }

        return [
          id,
          '(^|.*\\W)' + this.searchTerm + '(\\W.*|$)',
          '.*:' + this.searchTerm + '\\\$.*',
          '(^|.*\\W)' + this.searchTerm + '(\\W.*|$)',
          '(^|.*\\W)' + this.searchTerm + '(\\W.*|$)'
        ];
      }

      // TODO HACK
      // Searches anywhere in the genotype, even though precise positions have
      // been given.
      if (this.searchChromosomeX ||
        this.searchChromosome2 ||
        this.searchChromosome3 ||
        this.searchChromosome4 ||
        this.searchChromosomeY ||
        this.searchChromosomeU) {
        var searchTerm = '';

        // Top chromosomes:
        searchTerm += this.searchChromosomeX ? '.*:' + this.searchChromosomeX + '\\\$0@.*' : '';
        searchTerm += this.searchChromosome2 ? '.*:' + this.searchChromosome2 + '\\\$1@.*' : '';
        searchTerm += this.searchChromosome3 ? '.*:' + this.searchChromosome3 + '\\\$2@.*' : '';
        searchTerm += this.searchChromosome4 ? '.*:' + this.searchChromosome4 + '\\\$3@.*' : '';
        searchTerm += this.searchChromosomeY ? '.*:' + this.searchChromosomeY + '\\\$4@.*' : '';
        searchTerm += this.searchChromosomeU ? '.*:' + this.searchChromosomeU + '\\\$5@.*' : '';

        if (this.searchChromosomeX ||
          this.searchChromosome2 ||
          this.searchChromosome3 ||
          this.searchChromosome4) {
          searchTerm = '(' + searchTerm + ')|('
        }

        // Bottom chromosomes:
        searchTerm += this.searchChromosomeY ? '.*:' + this.searchChromosomeY + '\\\$4@.*' : '';
        searchTerm += this.searchChromosomeU ? '.*:' + this.searchChromosomeU + '\\\$5@.*' : '';
        searchTerm += this.searchChromosomeX ? '.*:' + this.searchChromosomeX + '\\\$6@.*' : '';
        searchTerm += this.searchChromosome2 ? '.*:' + this.searchChromosome2 + '\\\$7@.*' : '';
        searchTerm += this.searchChromosome3 ? '.*:' + this.searchChromosome3 + '\\\$8@.*' : '';
        searchTerm += this.searchChromosome4 ? '.*:' + this.searchChromosome4 + '\\\$9@.*' : '';

        if (this.searchChromosomeX ||
          this.searchChromosome2 ||
          this.searchChromosome3 ||
          this.searchChromosome4) {
          searchTerm += ')'
        }

alert('Searching for: ' + searchTerm);
        return searchTerm;
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
        gazebo.fly.Contribution.FLYBASE_DB,
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
              rowHash['0'] = 'qx/icon/Oxygen/16/actions/zoom-in.png';
              for (j = 0; j < result[i].length; j++) {
                rowHash[j + 1 + ''] = result[i][j];
              }
              // TODO Temporary hack for now..
              rowHash[result[i].length + 1 + ''] = 'Public'
              rowHash['' + (result[i].length + 2)] = result[i][7]
              resultList.push(rowHash);
            }
            that._onRowDataLoaded(resultList);
          }
        },
        "query_data",
        {},
        gazebo.fly.Contribution.FLYBASE_DB,
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