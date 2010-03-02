/* ************************************************************************

   Copyright:
		 2010 Joachim Baran, http://joachimbaran.wordpress.com
		 
   License: GPL, Version 3, http://www.gnu.org/licenses/gpl.html

   Authors:
	   * Joachim Baran

************************************************************************ */

/* ************************************************************************
#asset(gazebo/decoration/window/*)

************************************************************************ */

qx.Theme.define("gazebo.theme.Decoration",
{
  extend : qx.theme.modern.Decoration,
	
  decorations :
  {
		"window-captionbar-active" :
    {
      decorator : qx.ui.decoration.Grid,
			
      style : {
        baseImage : "gazebo/decoration/window/captionbar-active.png"
      }
    },
		
		"window-captionbar-inactive" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "gazebo/decoration/window/captionbar-inactive.png"
      }
    }
  }
});
