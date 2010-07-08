/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/**
 * A class for viewing genotypes.
 */
qx.Class.define("gazebo.fly.GenotypeViewer",
{
  extend : qx.ui.container.Scroll,

  statics :
  {
    chromosomeTitles: [
      'Chromosome X',
      'Chromosome 2',
      'Chromosome 3',
      'Chromosome 4',
      'Unknown',
      'Chromosome Y'
    ]
  },

  construct : function(parameters, listeners, overrides)
  {
    this.base(arguments);

    //this.setLayout(new qx.ui.layout.HBox(5));
    this.set({
      width: 900,
      height: 86
    });

    var container = new qx.ui.container.Composite();

    container.setLayout(new qx.ui.layout.HBox(2).set({ alignX: "center" }));

    for (var i = 0; i < 6; i++) {
      var chromosome = new qx.ui.groupbox.GroupBox(gazebo.fly.GenotypeViewer.chromosomeTitles[i]);

      chromosome.setLayout(new qx.ui.layout.VBox(2).set({ alignX: "center" }));
      chromosome.setMinWidth(85);
      if (i % 2 == 0) {
        chromosome.getChildrenContainer().setDecorator('group-dark');
      }

      chromosome.add(new qx.ui.basic.Label('+'));

      var separator = new qx.ui.menu.Separator();
      separator.setDecorator('separator-vertical');
      chromosome.add(separator);

      chromosome.add(new qx.ui.basic.Label('+'));

      container.add(chromosome);
    }

    this.add(container);
  },

  members:
  {

  }
});