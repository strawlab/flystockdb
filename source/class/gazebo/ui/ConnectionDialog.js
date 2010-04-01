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

	events :
	{
		"connect" : "qx.event.type.Event"
	},

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {String} Text for an example.
   */
  construct : function(queryMachineSettings)
  {
    this.base(arguments);

		this.setLayout(new qx.ui.layout.HBox(5));
		
		var form = new qx.ui.form.Form();
		
		if (queryMachineSettings) {
			form.addGroupHeader("Host Settings");
			this.host = new qx.ui.form.TextField("localhost");
			this.host.setRequired(true);
			form.add(this.host, "Host", qx.util.Validate.string());
			this.port = new qx.ui.form.Spinner(1, 8080, 65535);
			this.port.setRequired(true);
			form.add(this.port, "Port");

			form.addGroupHeader("Authentication");
		}
		var username = new qx.ui.form.TextField();
		username.setRequired(true);
		form.add(username, "Username", qx.util.Validate.string());
		var password = new qx.ui.form.PasswordField();
		password.setRequired(false);
		form.add(password, "Password");
		
		var dialog = this;
		
		var connectButton = new qx.ui.form.Button("Connect");
		connectButton.addListener("execute", function() {
			if (form.validate()) {
				var rpc = new qx.io.remote.Rpc();
				rpc.setTimeout(1000); // 1sec time-out, arbitrarily chosen.
				rpc.setUrl(gazebo.Application.getServerURL());
				rpc.setServiceName("gazebo.cgi");

				var that = this;
				this.RpcRunning = rpc.callAsync(
					function(result, ex, id)
					{
						that.RpcRunning = null;
						if (ex == null) {
							alert("Async(" + id + ") result: " + result);
							that.fireEvent("connect");
						} else {
							alert("Async(" + id + ") exception: " + ex);
						}
					},
					"connect",
					"One",
					"Two"
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
