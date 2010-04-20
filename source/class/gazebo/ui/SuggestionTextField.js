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
    
    this.dataSource = dataSource;

    this.textField = new qx.ui.form.TextField();
    this.textField.addListener("input", this.generateSuggestions, this);
    this.add(this.textField);
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
            alert('OK');
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
        [ "name" ],
        [ "x_synonym_" + textValue.length ],
        "name like '" + textValue + "'"
      );
    }
  }
});