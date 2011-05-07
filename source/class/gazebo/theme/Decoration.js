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
  extend : qx.theme.simple.Decoration,
	
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
      decorator: [
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MBackgroundColor
      ],

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
      decorator: [
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MBackgroundColor
      ],

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

    "groupX" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "gazebo/decoration/groupbox/groupbox.png"
      }
    },

    "group" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width : 1,
        color : "button-border",
        backgroundColor : "button-border"
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

    "button-box" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        radius : 15,
        width : 3,
        color : "button-border",
        backgroundColor : "#eeeeee"
      }
    },

    "button-box-pressed" :
    {
      include: "button-box",

      style :
      {
        radius : 0,
        width : 3,
        color : "button-border"
      }
    },

    "trial-box" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        radius : 15,
        width : 3,
        color : "#0066aa",
        backgroundColor : "#0099cc"
      }
    },

    "trial-box-pressed" :
    {
      include : "trial-box",

      style :
      {
        radius : 0,
        width : 3,
        color : "button-border",
        backgroundColor : "button-box-bright-pressed"
      }
    },

    "trial-box-pressed-hovered" :
    {
      include : "trial-box-pressed",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "trial-box-hovered" :
    {
      include : "trial-box",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "trial-box-focused" :
    {
      include : "trial-box",

      style :
      {
        color : "background-selected"
      }
    },

    "trial-box-pressed-focused" :
    {
      include : "trial-box-pressed",

      style :
      {
        color : "background-selected"
      }
    },

    "trial-box-hovered-focused" : {include: "trial-box-focused"},

    "trial-box-pressed-hovered-focused" : {include: "trial-box-pressed-focused"},

    "signup-box" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        radius : 15,
        width : 3,
        color : "#006633",
        backgroundColor : "#009966"
      }
    },

    "signup-box-pressed" :
    {
      include : "signup-box",

      style :
      {
        radius : 0,
        width : 3,
        color : "button-border",
        backgroundColor : "button-box-bright-pressed"
      }
    },

    "signup-box-pressed-hovered" :
    {
      include : "signup-box-pressed",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "signup-box-hovered" :
    {
      include : "signup-box",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "signup-box-focused" :
    {
      include : "signup-box",

      style :
      {
        color : "background-selected"
      }
    },

    "signup-box-pressed-focused" :
    {
      include : "signup-box-pressed",

      style :
      {
        color : "background-selected"
      }
    },

    "signup-box-hovered-focused" : {include: "signup-box-focused"},

    "signup-box-pressed-hovered-focused" : {include: "signup-box-pressed-focused"},

    "drop-box" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        //radius : 1,
        width : 1,
        color : "button-border",
        backgroundColor : "#eeeeee"
      }
    },

    "drop-box-hovered" :
    {
      include: "drop-box",

      style :
      {
        color : "button-border-hovered",
        backgroundColor : "button-border-hovered"
      }
    },

    /* Below: were used with "Modern" theme, now obsolete? */
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
