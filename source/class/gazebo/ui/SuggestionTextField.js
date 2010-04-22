/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************

#asset(gazebo/*)

************************************************************************ */

/**
 * A textfield with suggestions popping up as text is entered.
 */
qx.Class.define("gazebo.ui.SuggestionTextField",
{
  extend : qx.ui.container.Composite,

  /**
   * @param dataSource {String} Resource that is used for the pop-ups.
   */
  construct : function(dataSource)
  {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.VBox(5));
    
    this.dataSource = dataSource;

    var form = new qx.ui.form.Form();

    this.textField = new qx.ui.form.TextField();
    this.textField.setMinWidth(300);
    this.textField.addListener("input", this.generateSuggestions, this);
    form.add(this.textField, "Search");

    this.suggestionTree = new qx.ui.tree.Tree();
    this.suggestionTree.setMinHeight(400);
    this.suggestionTree.setHideRoot(true);
    this.suggestionTree.hide();
    this.suggestionTree.setOpacity(0);
    this.suggestionTree.addListenerOnce("appear", function(){
        animation = new qx.fx.effect.core.Fade(this.suggestionTree.getContainerElement().getDomElement());
        animation.set({
          from : 0.0,
          to : 1.0,
          duration : 0.8
         });
        animation.start();
      }, this);

    this.treeRoot = new qx.ui.tree.TreeFolder("Root");
    this.treeRoot.setOpen(true);
    this.suggestionTree.setRoot(this.treeRoot);
    
    this.add(new qx.ui.form.renderer.Single(form));
    this.add(this.suggestionTree);
  },

  members :
  {
    generateSuggestions : function(dataEvent)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(1000); // 1sec time-out, arbitrarily chosen.
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      var textValue = dataEvent.getData();

      if (!textValue) {
        return;
      }

      var that = this;
      this.RpcRunning = rpc.callAsync(
        function(result, ex, id)
        {
          if (that.RpcRunning) {
            that.RpcRunning = null;
            //that.suggestionList.setVisibility(true);
            that.treeRoot.removeAll();
            for (i = 0; i < result.length; i++) {
              if (result[i][1] > 1) {
                var folder = new qx.ui.tree.TreeFolder(result[i][0] + " (" + result[i][1] + " matches)");
                that.treeRoot.add(folder);
                for (j = 0; j < result[i][1]; j++) {
                  folder.add(new qx.ui.tree.TreeFile("" + j));
                }
              } else  {
                that.treeRoot.add(new qx.ui.tree.TreeFile(result[i][0]));
              }
            }
            that.suggestionTree.show();
            /*
            if (ex == null) {
              that.fireEvent("connect", qx.event.type.Data, [ "def" ]);
            } else {
              alert("Async(" + id + ") exception: " + ex);
            } */
          }
        },
        "query",
        "fb2010_03",
        [ "searchable", "occurrences" ],
        [ "x_searchables" ],
        "searchable like '" + textValue + "%'"
      );
    }
  }
});