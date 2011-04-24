/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************

#asset(gazebo/*)

************************************************************************ */

qx.Class.define("gazebo.interface.Administration",
{
  extend : qx.core.Object,
  implement : [ gazebo.IDelegator ],

  construct : function()
  {
  },

  members:
  {
    registerContributionName : function()
    {
      return "Gazebo";
    },

    registerInitialScreen : function(inquirer)
    {
      inquirer.addListenerOnce("screen.open", inquirer.generateAuthenticationDialog, inquirer);
      inquirer.addListenerOnce("screen.close", inquirer.disposeAuthenticationDialog, inquirer);
    },

    registerNextScreen : function(inquirer)
    {
      inquirer.addListenerOnce("screen.open", inquirer.generateConnectionDialog, inquirer);
      inquirer.addListenerOnce("screen.close", inquirer.disposeConnectionDialog, inquirer);
    }
  }
});