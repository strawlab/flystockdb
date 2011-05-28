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
    isAtom : function(string) {
      var decomposition = this.decompose(string);

      if (decomposition.length == 1) {
        var chromosomeBag = decomposition.shift();

        if (chromosomeBag.length == 1) {
          return true;
        }
      }

      return false;
    },

    symmetricBrackets : function(string) {
      var stack = new Array();

      for (var i = 0; i < string.length; i++) {
        var character = string.charAt(i);

        switch(character) {
        case '(':
        case '[':
        case '{':
          stack.push(character);
          break;
        case ')':
        case ']':
        case '}':
          if (stack.length > 0) {
            var previousBracket = stack.pop();

            if (character == ')' && previousBracket == '(') {
              // Ok
            } else if (character == ']' && previousBracket == '[') {
              // Ok
            } else if (character == '}' && previousBracket == '{') {
              // Ok
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
      }

      return stack.length == 0;
    },

    decomposeFeatureView : function(genotype) {
      var chromosomes = this.decompose(genotype);
      var genotypeContainer = new Array();

      for (var i = 0; i < chromosomes.length; i++) {
        var chromosomeContainer = new Array();
        var chromosome = new Array();
        var featureContainer = new Array();

        for (var j = 0; j < chromosomes[i].length; j++) {
          var token = chromosomes[i][j];

          if (token == '/') {
            chromosome.push(featureContainer);
            chromosomeContainer.push(chromosome);
            chromosome = new Array();
            featureContainer = new Array();
          } else {
            var notationMatch = token.match(/^@\w+:([^\$]+)\$\d+\$\d+@$/);

            if (notationMatch)
              token = notationMatch[1];

            x = new Object();
            x.plainModel = token;

            featureContainer.push(x);
          }
        }
        chromosome.push(featureContainer);
        chromosomeContainer.push(chromosome);
        genotypeContainer.push(chromosomeContainer);
      }

      return genotypeContainer;
    },

    decompose : function(genotype) {
      var components = new Array();

      var chromosomes = genotype.split(';'); // The naive view.
      var mendedChromosomes = new Array();

      for (var i = 0; i < chromosomes.length; i++) {
        var chromosome = chromosomes[i];

        if (!this.symmetricBrackets(chromosome)) {
          // Black magic. Old skool.
          for (i++; i < chromosomes.length; i++) {
            chromosome = chromosome + ';' + chromosomes[i];

            if (this.symmetricBrackets(chromosome)) {
              break;
            }
          }
        }

        mendedChromosomes.push(chromosome);
      }

      // The real thing, i.e. chromosomes with respect to special
      // cases where ; may appear within brackets.
      chromosomes = mendedChromosomes;

      for (i = 0; i < chromosomes.length; i++) {
        var chromosomeBag = new Array();

        chromosome = chromosomes[i];

        // Isolate '/' and ',', so we split on them too (due to the spaces)
        // TODO Autosynaptic elements are denoted by doubled forward-slashes,
        // i.e. '//', but they are not handled by this code yet.
        chromosome = chromosome.replace(/\//g, ' / ');
        chromosome = chromosome.replace(/,/g, ' , ');

        // Tokens are symbols and names.
        var tokens = chromosome.split(/\s/);

        for (var j = 0; j < tokens.length; j++) {
          var token = tokens[j].replace(/^\s+|\s+$/g, '');

          if (token.length == 0) {
            continue;
          }
          
          if (!this.symmetricBrackets(token)) {
            // More black magic. Still old skool.
            for (j++; j < tokens.length; j++) {
              token = token + ' ' + tokens[j].replace(/^\s+|\s+$/g, '');

              if (this.symmetricBrackets(token)) {
                break;
              }
            }
          }

          chromosomeBag.push(token);
        }

        components.push(chromosomeBag);
      }

      return components;
    }
  }
});