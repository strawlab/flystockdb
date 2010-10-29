/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/**
 * A class for assembling views of genotypes.
 */
qx.Class.define("gazebo.fly.GenotypeWriter",
{
  extend : qx.core.Object,

  construct: function()
  {
    this.base(arguments);
  },

  members:
  {
    flattenChromosome : function(chromosome)
    {
      var flat = ""

      for (var i = 0; i < chromosome.length; i++) {
        flat += chromosome[i].getValue();
      }

      return flat;
    },

    flybaseNotation : function(chromosomes)
    {
      flybaseString = ""

      for (var i = 0; i < chromosomes.length; i++) {
        if (!chromosomes[i]) {
          continue;
        }

        if (chromosomes[i].length == 1) {
          // Y or U
          this.flattenChromosome(chromosomes[i][0]);
        } else if (chromosomes[i].length == 2) {
          // X, 2, 3 or 4
          var parent1 = chromosomes[i][0];
          var parent2 = chromosomes[i][1];

          var everythingHomozygous = true;

          if (parent1.length != parent2.length) {
            everythingHomozygous = false;
          } else {
            for (var j = 0; j < parent1.length; j++) {
              if (parent1[j].getValue() != parent2[j].getValue()) {
                everythingHomozygous = false;
                break;
              }
            }
          }

          if (everythingHomozygous) {
            flybaseString += this.flattenChromosome(parent1);
          } else {
            flybaseString += this.flattenChromosome(parent1) + ' / ' + this.flattenChromosome(parent2);
          }
        } else {
          // Woops...
        }

        flybaseString += ' ; ';
      }

      return flybaseString;
    }
  }
});