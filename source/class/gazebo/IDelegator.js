/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************

#asset(gazebo/*)

************************************************************************ */

qx.Interface.define("gazebo.IDelegator",
{
  members :
  {
    registerContributionName : function() {},

    registerInitialScreen : function(inquirer) {},
    registerNextScreen : function(inquirer) {},

    generateLoginUI : function(inquirer) {},
    generateLogoutUI : function(inquirer) {}
  }
});
