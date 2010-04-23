/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************
#asset(gazebo/decoration/window/*)

************************************************************************ */

qx.Theme.define("gazebo.theme.Decoration",
{
  extend : qx.theme.modern.Decoration,
	
  decorations :
  {
    "shadow-window" :
    {
      decorator : qx.ui.decoration.Single,

      style : {
        // No shadows.
      }
    },
    
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
