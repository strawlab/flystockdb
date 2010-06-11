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
  },

  members:
  {
    registerContributionName : function()
    {
      return "Fly Stock";
    },

    registerInitialScreen : function(inquirer)
    {
      var searchWindow;

      this.inquirer = inquirer;

      inquirer.openScreen(inquirer.generateBasket, inquirer,
        {
          title: 'Genotype',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 20,
          populate: 6,
          titles: [ 'Chromosome X',
                    'Chromosome 2',
                    'Chromosome 3',
                    'Chromosome 4',
                    'Chromosome Y',
                    'Unknown'
                  ]
        }, {}, {});
        
      inquirer.openScreen(inquirer.generateSearchDialog, inquirer,
        {
          title: 'Search...',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 250,
          stripWhitespace: true,
          searchButtonTitle: 'Add'
        },
        {
          onKeyPress: { call: this.keyPressListener, context: this },
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
          top: 250,
          stripWhitespace: true,
          searchButtonTitle: 'All'
        },
        {
          onKeyPress: { call: this.keyPressListener, context: this },
          onInput: { call: this.inputListener, context: this }
        },
        {
          prepareFileSuggestion: this.prepareSuggestion
        });
    },

    keyPressListener : function(keyEvent)
    {
      this.debug('Key ID: ' + keyEvent.getKeyIdentifier());
      if (keyEvent.getKeyIdentifier() == 'Space' ||
          keyEvent.getKeyIdentifier() == 'Enter') {
        this.requestTransition = true;
      }
    },

    inputListener : function(dataEvent)
    {
      var treeItem = dataEvent.getData();
      var userInput = dataEvent.getOldData();
      var chromosome = 5 // Default placement: chromosome 'Unknown
      
      this.debug('Item: ' + treeItem + ' ' + userInput);
      
      if (treeItem) {
        var parameters = treeItem.model_workaround;

        if (parameters[3].charAt(0) == 'X') { chromosome = 0; }
        else if (parameters[3].charAt(0) == 'Y') { chromosome = 4; }
        else if (parameters[3].charAt(0) == '2') { chromosome = 1; }
        else if (parameters[3].charAt(0) == '3') { chromosome = 2; }
        else if (parameters[3].charAt(0) == '4') { chromosome = 3; }
      }

      if (userInput.length > 0 && this.requestTransition) {
        this.requestTransition = false;

        userInput = userInput.replace(/^\s+|\s+$/g, "");
        
        var container = new qx.ui.container.Composite();
        var label = new qx.ui.basic.Label().set({
          value: '<a href="http://www.guardian.co.uk">' + userInput + '</a>',
          rich: true
        });
        var controlButton = new qx.ui.form.Button('A');

        /*
        controlBox.add(new qx.ui.form.ListItem('Move to X'));
        controlBox.add(new qx.ui.form.ListItem('Move to 2'));
        controlBox.add(new qx.ui.form.ListItem('Remove'));]*/

        container.setLayout(new qx.ui.layout.HBox(5));
        container.add(label, { flex: 1 });
        container.add(controlButton, { flex: 0 });

        this.inquirer.setBasketItem(chromosome, container);
        
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

      file.model_workaround = parameters;

      return file;
    }
  }
});
