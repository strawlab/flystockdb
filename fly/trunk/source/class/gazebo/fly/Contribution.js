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

#asset(qx/icon/Oxygen/16/actions/list-add.png)

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

    this.reader = new gazebo.fly.GenotypeReader();
    this.reader.decompose("w/w ; P(abc;def), y / z ; x/CyO");
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
          top: 130,
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
          title: 'Find Gene, Allele, Balancer, ...',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 30,
          stripWhitespace: true,
          searchButtonTitle: '',
          searchButtonIcon: 'qx/icon/Oxygen/16/actions/list-add.png'
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
          title: 'Find Gene, Allele, Balancer, ...',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 30,
          stripWhitespace: true,
          searchButtonTitle: '',
          searchButtonIcon: 'qx/icon/Oxygen/16/actions/list-add.png'
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

        // Simple test to see whether a complete genotype might have been entered:
        if (userInput.indexOf(' ') != -1 ||
            userInput.indexOf(',') != -1 ||
            userInput.indexOf(';') != -1) {
          
        }

        var container = new qx.ui.container.Composite();
        container.setLayout(new qx.ui.layout.HBox(5));

        var label;

        var displayText = userInput;
        while (qx.bom.Label.getTextSize(displayText).width > 65) {
          displayText = displayText.substring(0, displayText.length - 2);
        }
        if (displayText != userInput) {
          displayText = displayText + '...';
        }

        if (flybaseId) {
          label = new qx.ui.basic.Label().set({
            value: '<u>' + displayText + '</u>',
            rich: true
          });

          label.addListener('click', function(mouseEvent) {
            qx.bom.Window.open('http://www.flybase.org/reports/' + flybaseId + '.html',
              'FlyBase Report',
              {},
              false);
          }, this);

          label.graphicalModel = label.getValue();

          label.addListener('mouseover', function(mouseEvent) {
            this.setValue("<span style='color: #5070bf;'>" + this.graphicalModel + "</span>");
          }, label);
          
          label.addListener('mouseout', function(mouseEvent) {
            this.setValue(this.graphicalModel);
          }, label);
        } else {
          label = new qx.ui.basic.Label().set({
            value: displayText,
            rich: true
          });
        }

        label.setToolTipText(userInput);

        var commaSwitch = new qx.ui.basic.Label().set({
          value: '<b style="color: #888;">,</b>',
          rich: true,
          textAlign: 'center',
          width: 22,
          height: 18
        });

        commaSwitch.addListener('click', function(mouseEvent) {
          if (this.getValue() == '<b style="color: #888;">,</b>') {
            this.setValue('<b style="color: #000;">,</b>');
          } else {
            this.setValue('<b style="color: #888;">,</b>');
          }
        }, commaSwitch);

        // Highlighting
        /*
        commaSwitch.currentlyRunningTransition = false;
        commaSwitch.addListener('mouseover', function(mouseEvent) {
          // Should move into 'appear', where only one instance should
          // be used for all commaSwitch instances.
          if (this.currentlyRunningTransition) {
            return;
          }

          this.currentlyRunningTransition = true;

          var domElement = this.getContainerElement().getDomElement();
          var colorFlow = new qx.fx.effect.combination.ColorFlow(domElement);

          var parent = this.getContainerElement().getDomElement();
          var status = qx.util.ColorUtil.cssStringToRgb(qx.bom.element.Style.get(parent, "backgroundColor")).toString();

          this.debug("X: " + qx.bom.element.Style.get(domElement, "backgroundColor"));
          this.debug("Y: " + qx.bom.element.Style.getCss(domElement));

          colorFlow.set({
            restoreBackground  : true,
            startColor         : "#ffffff",
            endColor           : "#dddddd",
            duration           : 0.3,
            backwardTransition : "none"
          });

          colorFlow.addListener('finish', function() {
            this.currentlyRunningTransition = false;
            qx.bom.element.Style.reset(domElement, "backgroundColor");
            qx.bom.element.Style.set(domElement, "backgroundColor", "rgb(0, 128, 255)");
            this.debug("ADASDASD");
          }, this);

          colorFlow.start();
        }, commaSwitch);
        */
        commaSwitch.addListener('mouseover', function(mouseEvent) {
          this.setDecorator('button-hovered');
        }, commaSwitch);
        commaSwitch.addListener('mousedown', function(mouseEvent) {
          this.setDecorator('button-pressed');
        }, commaSwitch);
        commaSwitch.addListener('mouseup', function(mouseEvent) {
          this.setDecorator('button-hovered');
        }, commaSwitch);
        commaSwitch.addListener('mouseout', function(mouseEvent) {
          this.setDecorator(null);
        }, commaSwitch);

        container.add(label);
        container.add(commaSwitch);

        this.genotypeBasket.addBasketItem(chromosome, container);
        
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
