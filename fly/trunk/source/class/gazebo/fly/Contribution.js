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

    keyPressListener : function(keyEvent)
    {
      this.debug('Key ID: ' + keyEvent.getKeyIdentifier());
      if (keyEvent.getKeyIdentifier() == 'Enter') {
        this.requestTransition = true;
      }
    },

    inputListener : function(dataEvent)
    {
      var treeItem = dataEvent.getData();
      var userInput = dataEvent.getOldData();
      var chromosome = 5 // Default placement: chromosome 'Unknown
      var chromosomeName = 'Unknown'
      var flybaseId = null;

      this.debug('Item: ' + treeItem + ' ' + userInput);
      
      if (treeItem) {
        var parameters = treeItem.model_workaround;

        chromosomeName = parameters[3].charAt(0);

        if (chromosomeName == 'X') { chromosome = 0; }
        else if (chromosomeName == 'Y') { chromosome = 4; }
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
        
        var container = new qx.ui.container.Composite();
        var label;
        var controlButton = new qx.ui.basic.Atom(null, "qx/icon/Oxygen/16/actions/help-about.png");

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

        var that = this;
        controlButton.addListener('click', function(mouseEvent) {
          var popup = new qx.ui.popup.Popup(new qx.ui.layout.VBox(5)).set({
            backgroundColor: "#EEEEEE",
            padding: [2, 4],
            offset : 3,
            offsetBottom : 20
          });

          for (var i = 0; i < 6; i++) {
            var chromosomeNames = [ 'X', '2', '3', '4', 'Y', 'Unknown'];

            if (i != chromosome) {
              var icon = that.getDirectionIcon(chromosome, i);
              popup.add(new qx.ui.basic.Atom("Move to " + chromosomeNames[i], icon));
            }
          }
          popup.add(new qx.ui.basic.Atom("Remove", 'qx/icon/Oxygen/16/actions/edit-delete.png'));
          popup.placeToMouse(mouseEvent);
          popup.show();
        });

        container.setLayout(new qx.ui.layout.HBox(5));
        container.add(controlButton, { flex: 0 });
        container.add(label, { flex: 1 });

        //qx.bom.Window.open('http://www.guardian.co.uk', 'Guardian', {}, false);
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
    },

    getDirectionIcon : function(position, destination) {
      if (position > destination) {
        return 'qx/icon/Oxygen/16/actions/go-previous.png';
      } else {
        return 'qx/icon/Oxygen/16/actions/go-next.png';
      }
    }
  }
});
