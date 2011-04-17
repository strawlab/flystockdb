/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

qx.Theme.define("gazebo.theme.Appearance",
{
  extend : qx.theme.simple.Appearance,

  appearances :
  {
    "window/captionbar" :
    {
      style : function(states)
      {
        return {
          decorator    : "window-captionbar",
          textColor    : "text-gray",
          minHeight    : 26,
          paddingRight : 2
        };
      }
    },

    "window/title" :
    {
      style : function(states)
      {
        return {
          alignY      : "middle",
          font        : "heading",
          marginLeft  : 0,
          marginRight : 12
        };
      }
    },

    "annotation" :
    {
      style : function(states)
      {
        return {
          textColor : states.selected ? "text-selected" : "text-gray"
        };
      }
    },

    "software/title" :
    {
      style : function(states)
      {
        return {
          alignY      : "middle",
          font        : "software/title",
          marginLeft  : 0,
          marginRight : 12
        };
      }
    },


    "fauxgroupbox" : {},

    "fauxgroupbox/legend" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          textColor : states.invalid ? "invalid" : undefined,
          padding : 0,
          margin : 0,
          font: "bold"
        };
      }
    },

    "fauxgroupbox/frame" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          padding : [6, 9],
          margin: [2, 2, 2, 2],
          decorator  : "white-box"
        };
      }
    }

  }
});