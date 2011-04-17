/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

qx.Theme.define("gazebo.theme.Font",
{
  extend : qx.theme.modern.Font,

  fonts :
  {
    "heading" :
    {
      size: 18,
      lineHeight : 1.4,
      family : qx.bom.client.Platform.MAC ? [ "Lucida Console", "Monaco" ] :
        (qx.bom.client.System.WINVISTA || qx.bom.client.System.WIN7) ?
        [ "Consolas" ] :
        [ "Consolas", "DejaVu Sans Mono", "Courier New", "monospace" ]
    },

    "software/title" :
    {
      size: 20,
      lineHeight : 1.4,
      family : qx.bom.client.Platform.MAC ? [ "Geneva" ] :
        (qx.bom.client.System.WINVISTA || qx.bom.client.System.WIN7) ?
        [ "Verdana" ] :
        [ "Geneva", "Verdana", "Arial", "sans-serif" ]
    },

    "italic" :
    {
      size : 13,
      family : ["arial", "sans-serif"],
      italic : true
    }
  }
});