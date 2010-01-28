/* ************************************************************************

   Copyright:
	   2010 Joachim Baran, http://joachim.baran.googlepages.com
		 
   License: GPL, Version 3, http://www.gnu.org/licenses/gpl.html

   Authors:
	   Joachim Baran

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
  construct : function(value)
  {
    this.base(arguments);

		this.setLayout(new qx.ui.layout.HBox(5));
		
		var form = new qx.ui.form.Form();
		
		form.addGroupHeader("Host Settings");
		var host = new qx.ui.form.TextField();
		host.setRequired(true);
		form.add(host, "Host");
		var port = new qx.ui.form.TextField();
		port.setRequired(true);
		form.add(port, "Port");
		
		form.addGroupHeader("Authentication");
		var username = new qx.ui.form.TextField();
		username.setRequired(true);
		form.add(username, "Username");
		var password = new qx.ui.form.PasswordField();
		password.setRequired(false);
		form.add(password, "Password");
		
		var connectButton = new qx.ui.form.Button("Connect");
		connectButton.addListener("execute", function() {
			if (form.validate()) {
				alert("Connect!");
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
