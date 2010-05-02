/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************

#asset(gazebo/*)

************************************************************************ */

/**
 * Interface for setting up a database connection or dealing
 * with use authentication.
 */
qx.Class.define("gazebo.ui.ConnectionDialog",
{
  extend : qx.ui.container.Composite,

	events :
	{
		"connect" : "qx.event.type.Event"
	},

  /**
   * @param queryMachineSettings {Boolean} Show host and port?
   * @param passwordRequired {Boolean} Is a password required?
   */
  construct : function(queryMachineSettings, passwordRequired)
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
		form.add(username, "Username",  function(text) {
      if (text == null) { return false; }
      var reg = /^[A-Za-z0-9_\-\.]+$/;
      return reg.test(text);
    });
    username.setInvalidMessage("Please enter a valid username.");
		var password = new qx.ui.form.PasswordField();
    if (passwordRequired) {
      password.setRequired(true);
    } else {
      password.setRequired(false);
    }
    form.add(password, "Password", function(text) {
      if (text == null || text.length == 0) { return false; }
      return true;
    });
    password.setInvalidMessage("Please enter your password.");
				
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
            if (that.RpcRunning) {
              that.RpcRunning = null;
              if (ex == null) {
                that.fireEvent("connect", qx.event.type.Data, [ "def" ]);
              } else {
                alert("Async(" + id + ") exception: " + ex);
              }
            }
					},
					"connect",
          username.getValue(),
					gazebo.support.ChrisVenessSHA1.sha1Hash(password.getValue())
				);
			}
		}, this);
		form.addButton(connectButton);
			
		this.add(new qx.ui.form.renderer.Single(form));
  },

  members :
  {
  }
});
