/* ************************************************************************

   Copyright:
	   2010 Joachim Baran, http://joachim.baran.googlepages.com
		 
   License: GPL, Version 3, http://www.gnu.org/licenses/gpl.html

   Authors:
	   * Joachim Baran

************************************************************************ */

/* ************************************************************************

#asset(gazebo/*)

************************************************************************ */

/**
 * Interface for setting up a database connection.
 */
qx.Class.define("gazebo.ui.ConnectionDialog",
{
  extend : qx.ui.container.Composite,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {String} Text for an example.
   */
  construct : function()
  {
    this.base(arguments);

		this.setLayout(new qx.ui.layout.HBox(5));
		
		var form = new qx.ui.form.Form();
		
		form.addGroupHeader("Host Settings");
		var host = new qx.ui.form.TextField();
		host.setRequired(true);
		form.add(host, "Host", qx.util.Validate.string());
		var port = new qx.ui.form.TextField();
		port.setRequired(true);
		form.add(port, "Port", qx.util.Validate.number());
		
		form.addGroupHeader("Authentication");
		var username = new qx.ui.form.TextField();
		username.setRequired(true);
		form.add(username, "Username", qx.util.Validate.string());
		var password = new qx.ui.form.PasswordField();
		password.setRequired(false);
		form.add(password, "Password");
		
		var connectButton = new qx.ui.form.Button("Connect");
		connectButton.addListener("execute", function() {
			if (form.validate()) {
				alert("Connect!");
				
				var rpc = new qx.io.remote.Rpc();
				rpc.setTimeout(1000);
				rpc.setUrl("http://127.0.0.1:8080/gazebo.cgi");
				rpc.setServiceName("gazebo.cgi");
				
				var that = this;
				this.RpcRunning = rpc.callAsync(
					function(result, ex, id)
					{
						that.RpcRunning = null;
						if (ex == null) {
							alert("Async(" + id + ") result: " + result);
						} else {
							alert("Async(" + id + ") exception: " + ex);
						}
					},
					"A Method..."
				);
				
			}
		}, this);
		form.addButton(connectButton);
			
		this.add(new qx.ui.form.renderer.Single(form));
		
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
  }
});
