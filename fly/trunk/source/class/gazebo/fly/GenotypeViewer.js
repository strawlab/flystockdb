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

    this.container = new qx.ui.container.Composite();

    this.container.setLayout(new qx.ui.layout.HBox(2).set({ alignX: "center" }));

    for (var i = 0; i < 6; i++) {
      var chromosome = new qx.ui.groupbox.GroupBox(gazebo.fly.GenotypeViewer.chromosomeTitles[i]);

      chromosome.setLayout(new qx.ui.layout.VBox(2).set({ alignX: "center" }));
      chromosome.setMinWidth(85);
      if (i % 2 == 0) {
        chromosome.getChildrenContainer().setDecorator('group-dark');
      }

      var topContainer = new qx.ui.container.Composite();
      var bottomContainer = new qx.ui.container.Composite();

      topContainer.setLayout(new qx.ui.layout.HBox(2).set({ alignX: "center" }));
      bottomContainer.setLayout(new qx.ui.layout.HBox(2).set({ alignX: "center" }));

      //topContainer.add(new qx.ui.basic.Label('+'));
      chromosome.add(topContainer);

      // Add separator and second chromosome for X, 2, 3, 4, U
      if (i < 5) {
        var separator = new qx.ui.menu.Separator();
        separator.setDecorator('separator-vertical');
        chromosome.add(separator);

        //bottomContainer.add(new qx.ui.basic.Label('+'));
        chromosome.add(bottomContainer);
      }

      this.container.add(chromosome);
    }

    this.add(this.container);
  },

  members:
  {
    addChromosomeItem : function(index, bottom, item) {
      var chromosomes = this.container.getChildren();

      var items = chromosomes[index].getChildren();

      if (bottom) {
        items[2].add(item);
      } else {
        items[0].add(item);
      }
    }
  }
});