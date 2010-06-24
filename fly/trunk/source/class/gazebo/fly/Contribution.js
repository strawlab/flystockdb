/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/* ************************************************************************

#asset(fly/flox300.png)

#asset(fly/balancer.png)
#asset(fly/gene.png)
#asset(fly/transgenic.png)
#asset(fly/transposon.png)

************************************************************************ */


/**
 * This is the main class of contribution "fly"
 */
qx.Class.define("gazebo.fly.Contribution",
{
  extend : qx.core.Object,
  implement : [ gazebo.IDelegator ],

  construct : function() 
  {
    this.inquirer = null;
    this.requestTransition = false;
    this.searchDialog = null;
  },

  members:
  {
    registerContributionName : function()
    {
      return "Fly Stock";
    },

    registerInitialScreen : function(inquirer)
    {
      this.inquirer = inquirer;

      inquirer.openScreen(inquirer.generateBasket, inquirer,
        {
          title: 'Genotype',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 20,
          populate: 11,
          titles: [ 'Chromosome X',
                    'Chromosome 2',
                    'Chromosome 3',
                    'Chromosome 4',
                    'Unknown',
                    'Chromosome Y',
                    '',
                    '',
                    '',
                    '',
                    ''
                  ],
          labels: [ 'X, top',
                    '2, top',
                    '3, top',
                    '4, top',
                    'U, top',
                    'Y',
                    'X, bottom',
                    '2, bottom',
                    '3, bottom',
                    '4, bottom',
                    'U, bottom'
                   ],
          decorations: [ 'group-dark',
                    'group',
                    'group-dark',
                    'group',
                    'group-dark',
                    'group',
                    'group-dark',
                    'group',
                    'group-dark',
                    'group',
                    'group-dark'
                   ]
        },
        {
          onOpen: { call: this.basketOpenListener, context: this }
        },
        { 
          makeEmptyBasketLabel: function(index) {
            return new qx.ui.basic.Label().set({
              value: '+',
              rich: true
            });
          }
        });
        
      inquirer.openScreen(inquirer.generateSearchDialog, inquirer,
        {
          title: 'Search...',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 560,
          stripWhitespace: true,
          searchButtonTitle: 'Add'
        },
        {
          onSearch: { call: this.searchListener, context: this },
          onInput: { call: this.inputListener, context: this }
        },
        {
          prepareFileSuggestion: this.prepareSuggestion
        });
    },

    registerNextScreen : function(inquirer)
    {
      inquirer.closeScreen(inquirer.disposeSearchDialog, inquirer, {});

      inquirer.openScreen(inquirer.generateSearchDialog, inquirer,
        {
          title: 'Search...',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 560,
          stripWhitespace: true,
          searchButtonTitle: 'Add'
        },
        {
          onSearch: { call: this.searchListener, context: this },
          onInput: { call: this.inputListener, context: this }
        },
        {
          prepareFileSuggestion: this.prepareSuggestion
        });
    },

    basketOpenListener : function(dataEvent) {
      this.genotypeBasket = dataEvent.getData();
    },

    searchListener : function(dataEvent)
    {
      this.requestTransition = true;
      this.inputListener(dataEvent);
    },

    inputListener : function(dataEvent)
    {
      var treeItem = dataEvent.getData();
      var userInput = dataEvent.getOldData();
      var chromosome = 4 // Default placement: chromosome 'Unknown'
      var chromosomeName = 'Unknown'
      var flybaseId = null;

      this.debug('Item: ' + treeItem + ' / ' + userInput);
      
      if (treeItem) {
        var parameters = treeItem.model_workaround;

        chromosomeName = parameters[3].charAt(0);

        if (chromosomeName == 'X') { chromosome = 0; }
        else if (chromosomeName == 'Y') { chromosome = 5; }
        else if (chromosomeName == '2') { chromosome = 1; }
        else if (chromosomeName == '3') { chromosome = 2; }
        else if (chromosomeName == '4') { chromosome = 3; }
        else { chromosomeName = 'Unknown'; }

        if (parameters[5] && parameters[5].match("^FB.+")) {
          flybaseId = parameters[5];
        }
      }

      if (userInput.length > 0 && this.requestTransition) {
        this.requestTransition = false;

        userInput = userInput.replace(/^\s+/, "");
        userInput = userInput.replace(/\s+$/, " ")
        
        var label;

        if (flybaseId) {
          label = new qx.ui.basic.Label().set({
            value: '<u>' + userInput + '</u>',
            rich: true
          });

          label.addListener('click', function(mouseEvent) {
            qx.bom.Window.open('http://www.flybase.org/reports/' + flybaseId + '.html',
              'FlyBase Report',
              {},
              false);
          }, this);
        } else {
          label = new qx.ui.basic.Label().set({
            value: userInput,
            rich: true
          });
        }

        this.genotypeBasket.addBasketItem(chromosome, label);
        // this.inquirer.setBasketItem(chromosome, container);
        
        this.inquirer.suggestScreenTransition();
      }
    },

    // Custom implementation of SuggestionTextField.prepareFileSuggestion
    prepareSuggestion : function(parameters)
    {
      var file;
      var abstraction = parameters[0];

      file = new qx.ui.tree.TreeFile();

      file.addState("small"); // Small icons.

      file.addSpacer();
      file.addLabel(abstraction);
      file.addWidget(new qx.ui.core.Spacer(), {flex: 1});

      /* Debugging code:
      for (j = 2; j < parameters.length; j++) {
        var customAnnotation = parameters[j];

        if (customAnnotation == '') {customAnnotation = '-';}

        if (j == 2 && customAnnotation == 'gene') {
          file.setIcon('fly/gene.png');
        } else if (j == 2 && customAnnotation == 'single balancer') {
          file.setIcon('fly/balancer.png');
        } else if (j == 2 && customAnnotation == 'transgenic_transposon') {
          file.setIcon('fly/transgenic.png');
        } else if (j == 2 && customAnnotation == 'natural_transposable_element') {
          file.setIcon('fly/transposon.png');
        }

        if (j > 2) {
          file.addWidget(new qx.ui.basic.Label(
            ",&nbsp;"
          ).set({appearance: "annotation", rich: true}));
        }
        file.addWidget(
          new qx.ui.basic.Label(
            customAnnotation
          ).set({appearance: "annotation", rich: true}));
      }
      */

      if (parameters[2] == 'gene') {
        file.setIcon('fly/gene.png');
      } else if (parameters[2] == 'single balancer') {
        file.setIcon('fly/balancer.png');
      } else if (parameters[2] == 'transgenic_transposon') {
        file.setIcon('fly/transgenic.png');
      } else if (parameters[2] == 'natural_transposable_element') {
        file.setIcon('fly/transposon.png');
      }

      if (parameters[3] != '') {
        file.addWidget(
          new qx.ui.basic.Label(
            'Chromosome ' + parameters[3]
          ).set({appearance: "annotation", rich: true}));
      }

      file.model_workaround = parameters;

      return file;
    }
  }
});
