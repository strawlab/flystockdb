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

  statics :
  {
    UI_BLANK : 0,
    UI_LOGIN : 1,
    UI_DASHBOARD : 2,
    UI_STOCKLIST : 3,
    UI_GENOTYPE_SEARCH : 4,
    UI_GENOTYPE_ENTRY : 5,
    UI_METADATA_ENTRY : 6,
    UI_LOGOUT : 7
  },

  construct : function()
  {
    this.inquirer = null;
    this.requestTransition = false;
    this.searchDialog = null;

    this.reader = new gazebo.fly.GenotypeReader();
  },

  members:
  {
    registerContributionName : function()
    {
      return "Fly-Stock Database";
    },

    registerInitialScreen : function(inquirer)
    {
      this.inquirer = inquirer;

      this.uiState = gazebo.fly.Contribution.UI_BLANK;

      this.generateDispatcher(inquirer);
    },

    registerNextScreen : function(inquirer)
    {
      switch(this.uiState) {
      case gazebo.fly.Contribution.UI_BLANK:
        break;
      case gazebo.fly.Contribution.UI_LOGIN:
        //inquirer.closeScreen(inquirer.disposeConnectionDialog, inquirer, {});
        break;
      }

      //this.generateLoginUI(inquirer);
      //inquirer.closeScreen(inquirer.disposeSearchDialog, inquirer, {});
      //inquirer.closeScreen(inquirer.disposeBasket, inquirer, {});

      //this.generateMetaDataUI(inquirer);
    },

    generateDispatcher : function(inquirer) {

      inquirer.openScreen(inquirer.generateAuthenticationDispatcher, inquirer,
        {
        },
        {
          'onAuthenticationSuccess': { call: this.dispatchListener, context: this },
          'onAuthenticationFailure': { call: this.dispatchListener, context: this }
        },
        {
        });

    },

    generateLoginUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateConnectionDialog, inquirer,
        {
          title: 'Login',
          passwordRequired: true
        },
        {
          'onConnect': { call: this.loginListener, context: this }
        },
        {});

    },

    generateDashboardUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateSearchDialog, inquirer,
        {
          title: 'Quick Search',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 30,
          stripWhitespace: true,
          searchButtonTitle: '',
          searchButtonIcon: 'qx/icon/Oxygen/16/actions/list-add.png'
        },
        {
          onOpen: { call: this.searchDialogOpenListener, context: this },
          onSearch: { call: this.searchListener, context: this },
          onInput: { call: this.inputListener, context: this }
        },
        {
          prepareFileSuggestion: this.prepareSuggestion
        });

    },

    generateGenotypeInputUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateBasket, inquirer,
        {
          title: 'Genotype',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 130,
          canProceedWithEmptyBasket: false,
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
          onOpen: { call: this.basketOpenListener, context: this },
          onProceed: { call: this.proceedListener, context: this }
        },
        {
          makeEmptyBasketLabel: function(index) {
            var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
            container.add(
              new qx.ui.basic.Label().set({
                value: '+',
                rich: true
              })
            );
            return container;
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
          onOpen: { call: this.searchDialogOpenListener, context: this },
          onSearch: { call: this.searchListener, context: this },
          onInput: { call: this.inputListener, context: this }
        },
        {
          prepareFileSuggestion: this.prepareSuggestion
        });

    },

    generateStockListUI : function(inquirer) {
      inquirer.openScreen(inquirer.generateCustomInterface, inquirer,
        {
          title: 'Stocks',
          left : inquirer.LEFT_SO_THAT_CENTERED,
          top: 30,
          contents: new gazebo.fly.StockListViewer()
        },
        {
        },
        {

        });
    },

    generateMetaDataUI : function(inquirer) {
      inquirer.openScreen(inquirer.generateCustomInterface, inquirer,
        {
          title: 'Genotype',
          left : inquirer.LEFT_SO_THAT_CENTERED,
          top: 30,
          contents: new gazebo.fly.GenotypeViewer()
        },
        {
          onOpen: { call: this.genotypeViewerOpenListener, context: this }
        },
        {

        });
    },

    generateLogoutUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateAuthenticationDispatcher, inquirer,
        {
          logout: true
        },
        {
          'onAuthenticationSuccess': { call: this.logoutListener, context: this },
          'onAuthenticationFailure': { call: this.logoutListener, context: this }
        },
        {});

    },

    dispatchListener : function(dataEvent) {
      if (dataEvent.getData()) {
        this.generateDashboardUI(this.inquirer);
      } else {
        this.generateLoginUI(this.inquirer);
      }
      this.inquirer.suggestScreenTransition();
    },

    loginListener : function(dataEvent) {
      if (dataEvent.getData()) {
        this.generateDashboardUI();
        this.inquirer.suggestScreenTransition();
      }
    },

    genotypeViewerOpenListener : function(dataEvent) {
      var chromosomes = new Array();

      for (var i = 0; i < 11; i++) {
        chromosomes.push(this.genotypeBasket.getBasketItems(i));
      }

      this.genotypeViewer = dataEvent.getData();

      for (var chromosome = 0; chromosome < chromosomes.length; chromosome++) {
        var bottom = chromosome < 6 ? false : true;
        var chromosomeBox = chromosome % 6;

        for (i = 0; i < chromosomes[chromosome].length; i++) {
          var items = chromosomes[chromosome][i].getChildren();

          while (items.length) {
            var item = items[0];

            chromosomes[chromosome][i].remove(item);

            if (item.isCommaSwitch) {
              if (item.isSwitchedOn) {
                item = new qx.ui.basic.Label(',');
              } else {
                item = new qx.ui.basic.Label(' ');
              }
            }

            this.genotypeViewer.addChromosomeItem(chromosomeBox, bottom, item);
          }
        }
      }
    },

    searchDialogOpenListener : function(dataEvent) {
      this.searchDialog = dataEvent.getData();
    },

    basketOpenListener : function(dataEvent) {
      this.genotypeBasket = dataEvent.getData();
    },

    proceedListener : function() {
      this.inquirer.suggestScreenTransition();
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
        var bottom = treeItem.annotation ? treeItem.annotation[0] : false;

        chromosomeName = parameters[3].charAt(0);

        if (chromosomeName == 'X') { chromosome = bottom ? 6 : 0; }
        else if (chromosomeName == 'Y') { chromosome = 5; }
        else if (chromosomeName == '2') { chromosome = bottom ? 7 : 1; }
        else if (chromosomeName == '3') { chromosome = bottom ? 8 : 2; }
        else if (chromosomeName == '4') { chromosome = bottom ? 9 : 3; }
        else { chromosomeName = 'Unknown'; chromosome = bottom ? 10 : 4; }

        if (parameters[5] && parameters[5].match("^FB.+")) {
          flybaseId = parameters[5];
        }
      }

      if (userInput.length > 0 && this.requestTransition) {
        this.requestTransition = false;

        userInput = userInput.replace(/^\s+|\s+$/g, "");

        // Simple test to see whether a complete genotype might have been entered:
        if (!this.reader.isAtom(userInput)) {
          var chromosomes = this.reader.decompose(userInput);

          while (chromosomes.length > 0) {
            var chromosomeBag = chromosomes.shift();
            bottom = false;

            while (chromosomeBag.length > 0) {
              var token = chromosomeBag.shift();
              var comma = false;

              if (token == '/') {
                bottom = true;
                continue;
              }

              if (chromosomeBag.length > 0 && chromosomeBag[0] == ',') {
                chromosomeBag.shift();
                comma = true;
              }

              if (this.reader.isAtom(token)) {
                this.debug('TOKEN ADDED:   ' + token);
                this.searchDialog.searchForItem(token, [bottom, comma]);
              } else {
                this.debug('TOKEN IGNORED: ' + token);
              }
            }
          }

          return;
        }

        var container = new qx.ui.container.Composite();
        container.setLayout(new qx.ui.layout.HBox(5));

        var label;

        var displayText = userInput;
        while (qx.bom.Label.getTextSize(displayText).width > 58) {
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

        commaSwitch.isCommaSwitch = true;
        commaSwitch.isSwitchedOn = false;

        if (treeItem && treeItem.annotation ? treeItem.annotation[1] : false) {
          commaSwitch.setValue('<b style="color: #000;">,</b>');
          commaSwitch.isSwitchedOn = true;
        }

        commaSwitch.addListener('click', function(mouseEvent) {
          if (this.getValue() == '<b style="color: #888;">,</b>') {
            this.setValue('<b style="color: #000;">,</b>');
            commaSwitch.isSwitchedOn = true;
          } else {
            this.setValue('<b style="color: #888;">,</b>');
            commaSwitch.isSwitchedOn = false;
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
        
        this.searchDialog.clear();
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
