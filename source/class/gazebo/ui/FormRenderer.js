/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/**
 * Simple form renderer.
 */
qx.Class.define("gazebo.ui.FormRenderer",
{
  extend : qx.ui.form.renderer.Single,

  construct : function(form)
  {
    this.base(arguments, form);
  },

  members :
  {

    _createLabelText : function(name, item)
    {
      var required = "";
      if (item.getRequired()) {
        // TODO What would be best?
        // required = " <span style='color:red'>X</span> ";
      }

      // Create the label. Append a colon only if there's text to display.
      var colon = name.length > 0 ? ":" : "";
      return name + required + colon;
    }

  }
});
