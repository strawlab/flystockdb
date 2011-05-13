/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/* ************************************************************************

#asset(fly/blue/check_alt_16x16.png)

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

    var buttonContainer = new qx.ui.container.Composite();
    buttonContainer.setLayout(new qx.ui.layout.VBox(10));

    buttonContainer.add(new qx.ui.basic.Label(''));

    var proceedButton = new qx.ui.form.Button().set({
        label: '<b>Import Stocks</b>',
        icon: 'fly/blue/check_alt_16x16.png',
        rich: true
      });

    proceedButton.addListener('click', this.onProceedListener, this);

    buttonContainer.add(proceedButton);

    mainContainer.add(buttonContainer);

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

    if (listeners['onProceed']) {
      listener = listeners['onProceed'];
      this.addListener("proceedRelay", listener['call'], listener['context']);
    }
  },

  members:
  {
    onProceedListener : function(event) {
      this.fireDataEvent("proceedRelay", "eve ena", null);
    }
  }
});
