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
      size : (qx.core.Environment.get("os.name") == "win" &&
        (qx.core.Environment.get("os.version") == "7" ||
        qx.core.Environment.get("os.version") == "vista")) ? 12 : 11,
      lineHeight : 1.4,
      family : qx.core.Environment.get("os.name") == "osx" ?
        [ "Lucida Grande" ] :
        ((qx.core.Environment.get("os.name") == "win" &&
          (qx.core.Environment.get("os.version") == "7" ||
          qx.core.Environment.get("os.version") == "vista"))) ?
        [ "Segoe UI", "Candara" ] :
        [ "Tahoma", "Liberation Sans", "Arial", "sans-serif" ],
      italic : true
    }
  }
});