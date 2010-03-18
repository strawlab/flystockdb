/* ************************************************************************

   Copyright:
	   2010 Joachim Baran, http://joachimbaran.wordpress.com
		 
   License: GPL, Version 3, http://www.gnu.org/licenses/gpl.html

   Authors:
	   * Joachim Baran

************************************************************************ */

/* ************************************************************************

#asset(gazebo/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "Gazebo"
 */
qx.Class.define("gazebo.Application",
{
  extend : qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

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

			this.generateConnectionDialog();

			this.debug("Main Application Up and Running: " + this.connectionWindow);
    },

		generateConnectionDialog : function ()
		{
			var connectionDialog = new gazebo.ui.ConnectionDialog();
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
			
			this.getRoot().add(this.connectionWindow);
			this.connectionWindow.open();
		},

		generateDatabaseInterface : function ()
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

			this.databaseWindow.add(new qx.ui.tree.Tree());

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

		establishConnection : function()
		{
			this.debug("Connection Established, " + this.connectionWindow);
			this.connectionWindow.close();
			this.generateDatabaseInterface();
		}
  }
});
