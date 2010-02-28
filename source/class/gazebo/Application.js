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
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }
						
			var connectionWindow = new qx.ui.window.Window("Database Connection");
			
			connectionWindow.setLayout(new qx.ui.layout.HBox(10));

			// Remember how to work with tables for later...
			// var tableModel = new qx.ui.table.model.Simple();			
			// tableModel.setColumns(['a', 'b']);
			// tableModel.setData([['abc', 'sdfsd'],['def', 'wefew']]);
			// var table = new qx.ui.table.Table(tableModel);
			// table.set({ width: 300, height: 200, decorator: null });
			// tableWindow.add(table);
			// table.updateContent();

			connectionWindow.add(new gazebo.ui.ConnectionDialog());
			connectionWindow.setResizable(false, false, false, false);
			connectionWindow.setMovable(false);
			connectionWindow.setShowClose(false);
			connectionWindow.setShowMaximize(false);
			connectionWindow.setShowMinimize(false);
			connectionWindow.addListener("resize", connectionWindow.center, connectionWindow);
			this.getRoot().add(connectionWindow);
			connectionWindow.open();

    }
  }
});
