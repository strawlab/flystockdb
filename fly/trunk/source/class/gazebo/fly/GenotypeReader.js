/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/**
 * A class for splitting genotypes into their components.
 */
qx.Class.define("gazebo.fly.GenotypeReader",
{
  extend : qx.core.Object,

  construct: function()
  {
    this.base(arguments);
  },

  members:
  {
    decompose : function(genotype) {
      var components = [];

      var chromosomes = genotype.match(/([a-z0-9]+)/gi);

      this.debug('Matches#: ' + chromosomes.length);
      this.debug('Matches:  ' + chromosomes);
    }
  }
});