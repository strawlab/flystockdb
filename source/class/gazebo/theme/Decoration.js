/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
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
