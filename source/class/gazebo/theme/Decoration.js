/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************

#asset(gazebo/decoration/window/*)
#asset(gazebo/decoration/groupbox/*)
#asset(gazebo/decoration/form/*)

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
        backgroundColor : null, // Transparent background.
        innerColor : "background-pane",
        color : "border-main",
        widthTop : 0,
        widthBottom : 0,
        widthLeft : 0,
        widthRight : 0,
        innerWidthLeft : 0,
        innerWidthRight : 0,
        innerWidthBottom : 0
      }
    },

    "window-captionbar" :
    {
      decorator : qx.ui.decoration.Double,

      style : {
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

    "group" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "gazebo/decoration/groupbox/groupbox.png"
      }
    },

    "group-dark" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "gazebo/decoration/groupbox/groupbox-dark.png"
      }
    },

    "group-blue" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "gazebo/decoration/groupbox/groupbox-blue.png"
      }
    },

    "scrollbar-slider-horizontal" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-button-bg-horizontal.png",
        backgroundRepeat : "scale",
        outerColor : "border-separator",
        innerColor : "white",
        innerOpacity : 0.5
      }
    },

    "scrollbar-slider-vertical" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-button-bg-vertical.png",
        backgroundRepeat : "scale",
        outerColor : "border-separator",
        innerColor : "white",
        innerOpacity : 0.5
      }
    }

  }
});
