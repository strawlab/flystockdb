/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************

#asset(gazebo/*)

************************************************************************ */

qx.Class.define("gazebo.Application",
{
  extend : qx.application.Standalone,

	statics :
	{
		// Hostname of the application's server
		hostname : qx.core.Setting.get("gazebo.server.hostname"),
		// HTTP port on the application's server, which might be null
		port : qx.core.Setting.get("gazebo.server.port"),

		// Generates the application's server URL
		getServerURL : function()
		{
			if (this.port) {
				return "http://" + this.hostname + ":" + this.port + "/gazebo.cgi";
			} else {
				return "http://" + this.hostname + "/gazebo.cgi";
			}
		}
	},

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      //if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }
						
			// Remember how to work with tables for later...
			// var tableModel = new qx.ui.table.model.Simple();			
			// tableModel.setColumns(['a', 'b']);
			// tableModel.setData([['abc', 'sdfsd'],['def', 'wefew']]);
			// var table = new qx.ui.table.Table(tableModel);
			// table.set({ width: 300, height: 200, decorator: null });
			// tableWindow.add(table);
			// table.updateContent();

			// this.generateConnectionDialog();
			// this.generateAuthenticationDialog();

			this.debug("Main Application Up and Running");
        
      var contributionArray = null;
      try {
        contributionArray = qx.core.Setting.get("gazebo.contributions");
      }
      catch(e) {}
      if (contributionArray) {
        for (var i = 0; i < contributionArray.length; i++) {
          this.debug("Inspecting contribution: " + contributionArray[i]);
          this.validateAndLoadContribution(contributionArray[i]);
        }
      }
    },

    validateAndLoadContribution : function(classname)
    {
      this.debug("A");
      if (qx.Class.isDefined(classname) == false) {
        return;
      }

      this.debug("B");
      var contributionClass = qx.Class.getByName(classname);

      if (!qx.Class.hasInterface(contributionClass, gazebo.IDelegator)) {
        return;
      }
      this.debug("C");

      this.contributionInstance = new contributionClass();

      this.debug("D");
      this.contributionInstance.registerInitialScreen(this);
      this.fireEvent("screen.open", null);
    },

		generateAuthenticationDialog : function()
		{
			var authenticationDialog = new gazebo.ui.ConnectionDialog(false, true);
			authenticationDialog.addListener("connect", this.establishConnection, this);

			this.authenticationWindow = new qx.ui.window.Window("Authentication");
			this.authenticationWindow.setLayout(new qx.ui.layout.HBox(10));
			this.authenticationWindow.add(authenticationDialog);
			this.authenticationWindow.setResizable(false, false, false, false);
			this.authenticationWindow.setMovable(false);
			this.authenticationWindow.setShowClose(false);
			this.authenticationWindow.setShowMaximize(false);
			this.authenticationWindow.setShowMinimize(false);

			this.authenticationWindow.addListener("resize", this.authenticationWindow.center, this.authenticationWindow);

			this.authenticationWindow.open();
      this.getRoot().add(this.authenticationWindow);
		},

    disposeAuthenticationDialog : function()
    {
      this.authenticationWindow.close();
    },

		generateConnectionDialog : function()
		{
			var connectionDialog = new gazebo.ui.ConnectionDialog(true, false);
			connectionDialog.addListener("connect", this.establishConnection, this);

			this.connectionWindow = new qx.ui.window.Window("Database Connection");
			this.connectionWindow.setLayout(new qx.ui.layout.HBox(10));
			this.connectionWindow.add(connectionDialog);
			this.connectionWindow.setResizable(false, false, false, false);
			this.connectionWindow.setMovable(false);
			this.connectionWindow.setShowClose(false);
			this.connectionWindow.setShowMaximize(false);
			this.connectionWindow.setShowMinimize(false);

			this.connectionWindow.addListener("resize", this.connectionWindow.center, this.connectionWindow);

      this.connectionWindow.open();      
      this.getRoot().add(this.connectionWindow);
		},

    disposeConnectionDialog : function()
    {
      this.connectionWindow.close();
    },

    generateSearchDialog : function()
    {
      var searchDialog = new gazebo.ui.SuggestionTextField();

      this.searchWindow = new qx.ui.window.Window("Search");
      this.searchWindow.setLayout(new qx.ui.layout.HBox(10));
      this.searchWindow.add(searchDialog);
      this.searchWindow.setResizable(false, false, false, false);
			this.searchWindow.setMovable(false);
			this.searchWindow.setShowClose(false);
			this.searchWindow.setShowMaximize(false);
			this.searchWindow.setShowMinimize(false);

			this.searchWindow.addListener("resize", this.searchWindow.center, this.searchWindow);

      this.searchWindow.open();
      this.getRoot().add(this.searchWindow);
    },

    disposeSearchDialog : function()
    {
      this.searchWindow.close();
    },

		generateDatabaseInterface : function()
		{
			this.dbComposite = new qx.ui.container.Composite();
			this.dbComposite.setLayout(new qx.ui.layout.Canvas());
			this.dbComposite.setPadding(5, 5, 5, 5);
			
			this.wfComposite = new qx.ui.container.Composite();
			this.wfComposite.setLayout(new qx.ui.layout.Canvas());
			this.wfComposite.setPadding(5, 5, 5, 5);
			
			this.databaseWindow = new qx.ui.window.Window("Databases");
			this.databaseWindow.setLayout(new qx.ui.layout.HBox(10));
			this.databaseWindow.setResizable(false, false, false, false);
			this.databaseWindow.setMovable(false);
			this.databaseWindow.setShowClose(false);
			this.databaseWindow.setShowMaximize(false);
			this.databaseWindow.setShowMinimize(false);

			this.databaseWindow.add(new qx.ui.tree.Tree(), { width: "100%" });

			this.workflowWindow = new qx.ui.window.Window("Workflow");
			this.workflowWindow.setLayout(new qx.ui.layout.HBox(10));
			this.workflowWindow.setResizable(false, false, false, false);
			this.workflowWindow.setMovable(false);
			this.workflowWindow.setShowClose(false);
			this.workflowWindow.setShowMaximize(false);
			this.workflowWindow.setShowMinimize(false);

			this.dbComposite.add(this.databaseWindow, { left: "0%", top: "0%", right: "0%", bottom: "0%" });
			this.wfComposite.add(this.workflowWindow, { left: "0%", top: "0%", right: "0%", bottom: "0%" });
			this.getRoot().add(this.dbComposite, { left: "0%", top: "0%", right: "75%", bottom: "0%" });
			this.getRoot().add(this.wfComposite, { left: "80%", top: "0%", right: "0%", bottom: "0%" });
			this.databaseWindow.open();
			this.workflowWindow.open();
		},

		establishConnection : function(dataEvent)
		{
      alert("Msg: " + dataEvent.getData());
			//this.debug("Connection Established, " + this.connectionWindow);
      //this.debug("connectionWindow: " + this['connectionWindow']);
      //this.debug("authenticationWindow: " + this['authenticationWindow']);
      //this.debug("Class:" + (new eval('gazebo.ui.ConnectionDialog')()));
      //this.authenticationWindow.close();
      this.fireEvent("screen.close", null);
			this.contributionInstance.registerNextScreen(this);
      this.fireEvent("screen.open", null);
		},

    screenTransition : function(dataEvent)
    {
      alert("Screen transition...");
    }
  }
});
