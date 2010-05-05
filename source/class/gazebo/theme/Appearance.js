/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

qx.Theme.define("gazebo.theme.Appearance",
{
  extend : qx.theme.modern.Appearance,

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
    }

  }
});