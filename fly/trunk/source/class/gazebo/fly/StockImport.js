/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/**
 * A class for bulk stock-imports.
 */
qx.Class.define("gazebo.fly.StockImport",
{
  extend : qx.ui.container.Composite,

  statics :
  {

  },

  construct : function(parameters, listeners, overrides)
  {
    this.base(arguments);

    this.inquirer = parameters['inquirer'];

    this.setLayout(new qx.ui.layout.HBox(10));

    this.setMinWidth(800);

    var mainContainer = new qx.ui.container.Composite();
    mainContainer.setLayout(new qx.ui.layout.VBox(10));

    mainContainer.add(new qx.ui.basic.Label().set({
      value: 'Stocks to Import',
      rich: true,
      appearance: 'annotation'
    }));

    this.stockTextArea = new qx.ui.form.TextArea().set({
      maxLength: 1500000, // 1.5M. Remark: 65k is approx. enough for 100 stocks.
      height: 575,
      width: 900
    });
    mainContainer.add(this.stockTextArea);

    this.add(mainContainer);

    this.add(new qx.ui.toolbar.Separator());

    var buttonContainer = new qx.ui.container.Composite();
    buttonContainer.setLayout(new qx.ui.layout.VBox(10));

    buttonContainer.add(new qx.ui.basic.Label(''));

    var proceedButton = new qx.ui.form.Button(null, "icon/64/actions/dialog-ok.png");
    proceedButton.setHeight(575);
    buttonContainer.add(proceedButton);

    this.add(buttonContainer);
  },

  members:
  {
    
  }
});
