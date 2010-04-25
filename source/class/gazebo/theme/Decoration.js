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

    "window" :
    {
      decorator: qx.ui.decoration.Double,

      style :
      {
        backgroundColor : "background-pane",
        innerColor : "background-pane",
        color : "border-main",
        widthTop : 0,
        widthBottom : 1,
        widthLeft : 1,
        widthRight : 1,
        innerWidthLeft : 0,
        innerWidthRight : 0,
        innerWidthBottom : 6
      }
    },

    "window-captionbar" :
    {
      decorator : qx.ui.decoration.Double,

      style : {
        //baseImage : "gazebo/decoration/window/captionbar-inactive.png"
        backgroundColor : "background-pane",
        innerColor : "background-pane",
        colorBottom : "background-pane",
        innerColorBottom: "border-separator",
        innerWidthBottom : 1,
        widthBottom : 10,
        innerWidthLeft : 10,
        widthRight : 10
      }
    },

    "Ywindow-captionbar" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundColor : "#FF00FF",
        innerColor : "#AA0099",
        innerOpacity : 0.6,
        outerColor : "#0000FF"
      }
    },

		"Xwindow-captionbar" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "gazebo/decoration/window/captionbar-inactive.png"
      }
    }
  }
});
