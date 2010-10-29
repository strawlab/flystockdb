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
    // States are not used yet.
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

    this.statusOpen = false;

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
          onAuthenticationSuccess: { call: this.dispatchListener, context: this },
          onAuthenticationFailure: { call: this.dispatchListener, context: this },
          onTransitionCloseScreen: {
            call: inquirer.disposeAuthenticationDispatcher,
            context: inquirer,
            parameters: {}
          }
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
          onConnect: { call: this.loginListener, context: this },
          onTransitionCloseScreen: {
            call: inquirer.disposeConnectionDialog,
            context: inquirer,
            parameters: {}
          }
        },
        {});

    },

    generateDashboardUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateSearchDialog, inquirer,
        {
          title: 'Quick Search',
          left: 10,
          top: 100,
          textFieldMinimalWidth: 150,
          stripWhitespace: true,
          searchButtonTitle: '',
          searchButtonIcon: 'qx/icon/Oxygen/16/actions/dialog-ok.png'
        },
        {
          onOpen: { call: this.searchDialogOpenListener, context: this },
          onSearch: { call: this.searchListener, context: this },
          onInput: { call: this.inputListener, context: this },
          onTransitionCloseScreen: {
            call: inquirer.disposeSearchDialog,
            context: inquirer,
            parameters: {}
          }
        },
        {
          prepareFileSuggestion: this.prepareSuggestion
        });

      var linkContainer = new qx.ui.container.Composite();

      var that = this;

      homeLink = new qx.ui.basic.Atom().set({
        label: '<u>Home</u>',
        rich: true,
        icon: 'qx/icon/Oxygen/16/actions/go-home.png',
        padding: [2, 6, 2, 6]
      });
      homeLink.addListener('click', function(mouseEvent) {
        that.generateDashboardUI(that.inquirer);
        that.inquirer.suggestScreenTransition();
      }, this);

      searchLink = new qx.ui.basic.Atom().set({
        label: '<u>Advanced Search</u>',
        rich: true,
        icon: 'qx/icon/Oxygen/16/actions/edit-find.png',
        padding: [2, 6, 2, 6]
      });
      searchLink.addListener('click', function(mouseEvent) {
        that.generateSearchUI(that.inquirer);
        that.inquirer.suggestScreenTransition();
      }, this);

      addLink = new qx.ui.basic.Atom().set({
        label: '<u>Add Fly-Stock</u>',
        rich: true,
        icon: 'qx/icon/Oxygen/16/actions/list-add.png',
        padding: [2, 6, 2, 6]
      });
      addLink.addListener('click', function(mouseEvent) {
        that.generateGenotypeInputUI(that.inquirer);
        that.inquirer.suggestScreenTransition();
      }, this);

      administrationLink = new qx.ui.basic.Atom().set({
        label: '<u>Administration</u>',
        rich: true,
        icon: 'qx/icon/Oxygen/16/apps/utilities-keyring.png',
        padding: [2, 6, 2, 6]
      });
      administrationLink.addListener('click', function(mouseEvent) {
        that.generateAdministrationUI(that.inquirer);
        that.inquirer.suggestScreenTransition();
      }, this);

      linkContainer.setLayout(new qx.ui.layout.HBox(10));
      linkContainer.add(homeLink);
      linkContainer.add(searchLink);
      linkContainer.add(addLink);
      linkContainer.add(administrationLink);

      if (!this.statusOpen) {
        this.statusOpen = true;

        inquirer.openScreen(inquirer.generateStatusDisplay, inquirer,
          {
            title: ' ',
            left: 10,
            top: 10,
            minWidth: 800,
            customElements: linkContainer
          },
          {
            /* Make permanent.
            // TODO Remove on log-out
            onTransitionCloseScreen: {
              call: inquirer.disposeStatusDisplay,
              context: inquirer,
              parameters: {}
            }
             */
          },
          {});
      }

      this.generateStockListUI(inquirer);
    },

    generateGenotypeInputUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateBasket, inquirer,
        {
          title: 'Genotype',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 200,
          canProceedWithEmptyBasket: true, // For entering wild-type stocks.
          populate: 10,
          titles: [ 'Chromosome X',
                    'Chromosome 2',
                    'Chromosome 3',
                    'Chromosome 4',
                    'Chromosome Y',
                    'Unknown',
                    '',
                    '',
                    '',
                    ''
                  ],
          labels: [ 'X, top',
                    '2, top',
                    '3, top',
                    '4, top',
                    'Y',
                    'U',
                    'X, bottom',
                    '2, bottom',
                    '3, bottom',
                    '4, bottom'
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
                    'group'
                   ]
        },
        {
          onOpen: { call: this.basketOpenListener, context: this },
          onProceed: { call: this.proceedListener, context: this },
          onTransitionCloseScreen: {
            call: inquirer.disposeBasket,
            context: inquirer,
            parameters: {}
          }
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
          title: 'Add Gene, Allele, Balancer, ...',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 100,
          stripWhitespace: true,
          searchButtonTitle: '',
          searchButtonIcon: 'qx/icon/Oxygen/16/actions/list-add.png'
        },
        {
          onOpen: { call: this.searchDialogOpenListener, context: this },
          onSearch: { call: this.searchListener, context: this },
          onInput: { call: this.inputListener, context: this },
          onTransitionCloseScreen: {
            call: inquirer.disposeSearchDialog,
            context: inquirer,
            parameters: {}
          }
        },
        {
          prepareFileSuggestion: this.prepareSuggestion
        });

    },

    // TODO Have to remove commas from baskets.
    generateSearchUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateBasket, inquirer,
        {
          title: 'Genotype',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 190,
          basketMinHeight: 150,
          canProceedWithEmptyBasket: true,
          populate: 6,
          titles: [ 'Chromosome X',
                    'Chromosome 2',
                    'Chromosome 3',
                    'Chromosome 4',
                    'Chromosome Y',
                    'Unknown'
                  ],
          labels: [ 'X',
                    '2',
                    '3',
                    '4',
                    'Y',
                    'U'
                   ],
          decorations: [ 'group-dark',
                    'group',
                    'group-dark',
                    'group',
                    'group-dark',
                    'group'
                   ]
        },
        {
          onOpen: { call: this.basketOpenListener, context: this },
          onProceed: { call: this.proceedListener, context: this },
          onTransitionCloseScreen: {
            call: inquirer.disposeBasket,
            context: inquirer,
            parameters: {}
          }
        },
        {
          makeEmptyBasketLabel: function(index) {
            var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
            container.add(
              new qx.ui.basic.Label().set({
                value: '<i>anything</i>',
                rich: true
              })
            );
            return container;
          }
        });

      inquirer.openScreen(inquirer.generateSearchDialog, inquirer,
        {
          title: 'Add Gene, Allele, Balancer, ...',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 100,
          stripWhitespace: true,
          searchButtonTitle: '',
          searchButtonIcon: 'qx/icon/Oxygen/16/actions/list-add.png'
        },
        {
          onOpen: { call: this.searchDialogOpenListener, context: this },
          onSearch: { call: this.searchListener, context: this },
          onInput: { call: this.inputListener, context: this },
          onTransitionCloseScreen: {
            call: inquirer.disposeSearchDialog,
            context: inquirer,
            parameters: {}
          }
        },
        {
          prepareFileSuggestion: this.prepareSuggestion
        });

      inquirer.openScreen(inquirer.generateCustomInterface, inquirer,
        {
          title: 'Metadata',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 430,
          contents: new gazebo.fly.GenotypeMetadata(
            { inquirer: inquirer, search: true },
            {},
            {}
          )
        },
        {
          onTransitionCloseScreen: {
            call: inquirer.disposeCustomInterface,
            context: inquirer,
            parameters: {}
          }
        },
        {

        }
      );

    },

    generateAdministrationUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateCustomInterface, inquirer,
        {
          title: 'User Administration',
          left : inquirer.LEFT_SO_THAT_CENTERED,
          top: 95,
          contents: new gazebo.ui.Administration(
            { inquirer: inquirer },
            {},
            {}
          )
        },
        {
          onTransitionCloseScreen: {
            call: inquirer.disposeCustomInterface,
            context: inquirer,
            parameters: {}
          }
        },
        {

        });

    },

    generateStockListUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateCustomInterface, inquirer,
        {
          title: 'Stocks',
          left : 300,
          top: 100,
          contents: new gazebo.fly.StockListViewer()
        },
        {
          onTransitionCloseScreen: {
            call: inquirer.disposeCustomInterface,
            context: inquirer,
            parameters: {}
          }
        },
        {

        });

    },

    generateMetaDataUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateCustomInterface, inquirer,
        {
          title: 'Genotype',
          left : inquirer.LEFT_SO_THAT_CENTERED,
          top: 100,
          contents: new gazebo.fly.GenotypeViewer()
        },
        {
          onOpen: { call: this.genotypeViewerOpenListener, context: this },
          onTransitionCloseScreen: {
            call: inquirer.disposeCustomInterface,
            context: inquirer,
            parameters: {}
          }
        },
        {}
      );

      inquirer.openScreen(inquirer.generateCustomInterface, inquirer,
        {
          title: 'Metadata',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 270,
          contents: new gazebo.fly.GenotypeMetadata(
            {
              inquirer: inquirer
            },
            {
              onOpen: { call: this.metadataEditorOpenListener, context: this }
            },
            {}
          )
        },
        {
          onTransitionCloseScreen: {
            call: inquirer.disposeCustomInterface,
            context: inquirer,
            parameters: {}
          }
        },
        {
          
        }
      );

    },

    generateLogoutUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateAuthenticationDispatcher, inquirer,
        {
          logout: true
        },
        {
          onAuthenticationSuccess: { call: this.logoutListener, context: this },
          onAuthenticationFailure: { call: this.logoutListener, context: this },
          onTransitionCloseScreen: {
            call: inquirer.disposeAuthenticationDispatcher,
            context: inquirer,
            parameters: {}
          }
        },
        {});

    },

    dispatchListener : function(dataEvent) {
      var status = dataEvent.getData();
      if (status && status['logged_in']) {
        this.generateDashboardUI(this.inquirer);
      } else {
        this.generateLoginUI(this.inquirer);
      }
      this.inquirer.suggestScreenTransition();
    },

    loginListener : function(dataEvent) {
      if (dataEvent.getData()) {
        this.generateDashboardUI(this.inquirer);
        this.inquirer.suggestScreenTransition();
      }
    },

    logoutListener : function(dataEvent) {
      this.generateLoginUI(this.inquirer);
      this.inquirer.suggestScreenTransition();
    },

    genotypeViewerOpenListener : function(dataEvent) {
      var chromosomes = new Array();

      for (var i = 0; i < 10; i++) {
        this.debug("Opening " + i);
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

    metadataEditorOpenListener : function(dataEvent) {

      var genotypeMetadataUI = dataEvent.getData();

      var rpc = new qx.io.remote.Rpc();
			rpc.setTimeout(2000); // 2sec time-out, arbitrarily chosen.
			rpc.setUrl(gazebo.Application.getServerURL());
			rpc.setServiceName("gazebo.cgi");

      var that = this;

      this.rpcRunning = rpc.callAsync(
        function(result, ex, id)
        {
          if (that.rpcRunning && that.rpcRunning.getSequenceNumber() == id) {
              var stock_id = result;

              genotypeMetadataUI.updateInternalStockID("" + stock_id);
          }
        },
        "create_data",
        {},
        "FB2010_05",
        "x_stocks",
        [ "xref", "genotype", "description", "donor" ],
        [ "", "", "", "" ]
      );

    },

    searchDialogOpenListener : function(dataEvent) {
      this.searchDialog = dataEvent.getData();
    },

    basketOpenListener : function(dataEvent) {
      this.genotypeBasket = dataEvent.getData();
    },

    proceedListener : function() {
      this.generateMetaDataUI(this.inquirer);
      this.inquirer.suggestScreenTransition();
    },

    searchListener : function(dataEvent)
    {
      this.requestTransition = true;
      this.inputListener(dataEvent);
    },

    inputListener : function(dataEvent)
    {
      ////
      //Some testing..
      var writer = new gazebo.fly.GenotypeWriter();
      var chromosomes = new Array(6);

      for (var x = 0; x < chromosomes.length; x++) {
        chromosomes[x] = [];
      }

      for (x = 0; x < 10; x++) {
        var items = this.genotypeBasket.getBasketItems(x);
        var bag = new Array();

        for (var y = 0; y < items.length; y++) {
          var labels = items[y].getChildren();

          bag.push(labels[0]);
        }

        if (x < 6) {
          chromosomes[x].push(bag);
        } else {
          chromosomes[x % 6].push(bag);
        }
      }
      //alert(chromosomes);
      alert(writer.flybaseNotation(chromosomes));
      ////
      var compound = dataEvent.getData();
      var treeItem = compound[0];
      var userInput = compound[1];
      var reQuery = compound[2];
      var initialParameters = dataEvent.getOldData();

      var suggestedAides = compound.length > 2 ? compound[2] : null;

      var chromosome = 5 // Default placement: chromosome 'Unknown'
      var chromosomeName = 'Unknown'
      var flybaseId = null;

      this.debug('INPUT LISTENER: Item: ' + treeItem + ' / ' + userInput);

      if (treeItem) {
        var parameters = treeItem.model_workaround[0];

        if (reQuery) {
          if (parameters && !parameters[3]) {
            for (var i = 1; i < treeItem.model_workaround.length && !parameters[3]; i++) {
              parameters = treeItem.model_workaround[i];
            }
          }

          if (initialParameters) {
            parameters[0] = initialParameters[0];
            parameters[1] = initialParameters[1];
            parameters[2] = initialParameters[2];
            parameters[5] = initialParameters[5];
            parameters[6] = initialParameters[6];

            treeItem.model_workaround = parameters;
          } else {
            parameters[0] = null;
            parameters[1] = null;
            parameters[2] = null;
            parameters[5] = null;
            parameters[6] = null;

            treeItem.model_workaround = parameters;
          }
        }

        var bottom = treeItem.annotation ? treeItem.annotation[0] : false;

        chromosomeName = parameters[3].charAt(0);

        if (chromosomeName == 'X') { chromosome = bottom ? 6 : 0; }
        else if (chromosomeName == 'Y') { chromosome = 4; }
        else if (chromosomeName == '2') { chromosome = bottom ? 7 : 1; }
        else if (chromosomeName == '3') { chromosome = bottom ? 8 : 2; }
        else if (chromosomeName == '4') { chromosome = bottom ? 9 : 3; }
        else { chromosomeName = 'Unknown'; chromosome = 5; }

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

            // Is this a partite bag?
            var partite = false;
            var possibleBalancer = '-';
            for (var i = 0; i < chromosomeBag.length; i++) {
              if (chromosomeBag[i] == '/') {
                partite = true;
                if (i + 1 < chromosomeBag.length) {
                  possibleBalancer = chromosomeBag[i + 1];
                }
                break;
              }
            }

            // If not partite, then make homozygous:
            this.debug("PARTITE: " + partite);
            var chromosomeBagDuplicate = chromosomeBag.concat();
            if (!partite) {
              chromosomeBag = chromosomeBag.concat([ '/' ].concat(chromosomeBagDuplicate));
            }

            var position = 0;
            while (chromosomeBag.length > 0) {
              var token = chromosomeBag.shift();
              var comma = false;

              if (token == '/') {
                bottom = true;
                position = 0;
                continue;
              }

              if (chromosomeBag.length > 0 && chromosomeBag[0] == ',') {
                chromosomeBag.shift();
                comma = true;
              }

              if (this.reader.isAtom(token)) {
                // Collect further tokens that might help to resolve
                // the chromosomal position of the token.
                var splicePoint;
                var aides = suggestedAides;

                if (!aides) {
                  aides = chromosomeBagDuplicate.concat([ possibleBalancer ]);
                }

                // Remove the token itself from the aides.
                while ((splicePoint = aides.indexOf(token)) >= 0) {
                  aides.splice(splicePoint, 1);
                }

                // Remove the '/' delimiter from the aides.
                while ((splicePoint = aides.indexOf('/')) >= 0) {
                  aides.splice(splicePoint, 1);
                }

                this.debug('TOKEN ADDED:   ' + token + " (" + possibleBalancer + ") [" + position + "]");
                this.searchDialog.searchForItem(token, [bottom, comma, position], aides, 3);
                position++;
              } else {
                this.debug('TOKEN IGNORED: ' + token + " (" + possibleBalancer + ")");
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

        // In case the input cannot be put on a chromosome, it goes onto
        // the 'Unknown' chromosome without any particular ordering.
        var weight = treeItem && treeItem.annotation ? treeItem.annotation[2] : null;

        this.genotypeBasket.addBasketItem(chromosome, container, weight);
        
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
