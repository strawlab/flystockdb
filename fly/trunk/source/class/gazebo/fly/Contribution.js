/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/* ************************************************************************

#asset(fly/flystockdb160.png)

#asset(fly/balancer.png)
#asset(fly/gene.png)
#asset(fly/transgenic.png)
#asset(fly/transposon.png)

#asset(fly/black/move_8x8.png)
#asset(fly/gray_light/user_12x16.png)
#asset(fly/gray_light/home_16x16.png)
#asset(fly/gray_light/plus_16x16.png)
#asset(fly/gray_light/eject_16x16.png)
#asset(fly/gray_light/cog_alt_16x16.png)
#asset(fly/gray_light/magnifying_glass_16x16.png)

#asset(fly/blue/plus_16x16.png)
#asset(fly/blue/magnifying_glass_16x16.png)
#asset(fly/blue/arrow_right_16x16.png)

#asset(fly/orange/x_alt_16x16.png)

#asset(qx/icon/Oxygen/16/actions/list-add.png)

************************************************************************ */


/**
 * This is the main class of the contribution "flystockdb"
 */
qx.Class.define("gazebo.fly.Contribution",
{
  extend : qx.core.Object,
  implement : [ gazebo.IDelegator ],

  statics :
  {
    FOOTER_PREAMBLE : 'FlyBase Nomenclature: ',
    FLYBASE_DB : 'FB2010_09'
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

      this.generateDispatcher(inquirer);
    },

    registerNextScreen : function(inquirer)
    {

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

      var presentationContainer = new qx.ui.container.Composite();
      var logoContainer = new qx.ui.container.Composite();

      presentationContainer.setLayout(new qx.ui.layout.HBox(10).set({
        alignY: "top"
      }));

      logoContainer.setLayout(new qx.ui.layout.VBox(10).set({
        alignX: "center"
      }));
      logoContainer.add(new qx.ui.basic.Image('fly/flystockdb160.png'));
      logoContainer.add(new qx.ui.basic.Label().set({
        value: '<a style="color: #0099cc;">fly</a><a style="color: #009966;">stock</a><a style="color: #333333;">db</a>',
        rich: true,
        appearance: 'software/title'
      }));
      logoContainer.add(new qx.ui.core.Spacer(10,10));

      presentationContainer.add(new qx.ui.core.Spacer(5, 5));
      presentationContainer.add(logoContainer);
      presentationContainer.add(new qx.ui.core.Spacer(25, 5));
      presentationContainer.add(new qx.ui.basic.Label().set({
        value: '&nbsp;<br />' +
          '<a style="color: #0099cc;">fly</a><a style="color: #009966;">stock</a><a style="color: #333333;">db</a>' +
          ' is the first <b>free</b> web-based database for<br />managing and sharing Drosophila melanogaster stocks.' +
          '<br />&nbsp;<br />' +
          'Its source-code is available under the Simplified BSD<br />License at: <a href="https://github.com/joejimbo/flystockdb">https://github.com/joejimbo/flystockdb</a>' +
          '<br />Contributors, collaborators and competitors are welcome<br />' +
          'to contribute, to collaborate, and to compete as they please.' +
          '<br />&nbsp;<br /><div style="text-align: right;">Joachim<br />' +
          '<span style="color: #777777;">joachim.baran [ <i>at</i> ] gmail.com</span></div>',
        rich: true,
        appearance: 'annotation'
      }));
      
      inquirer.openScreen(inquirer.generateConnectionDialog, inquirer,
        {
          title: 'Sneak Peek Preview: For Invitees',
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          passwordRequired: true,
          logo: presentationContainer
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

    highlightMenu : function()
    {
      for (var i = 0; i < this.statusWidgets.length; i++)
        if (this.statusWidgets[i] == this.selectedScreen) {
          this.statusWidgets[i].setTextColor('#333333');
          this.statusWidgets[i].setBackgroundColor('#ffffff');
        } else {
          this.statusWidgets[i].setTextColor('#ffffff');
          this.statusWidgets[i].setBackgroundColor(null);
        }
    },

    generateDashboardUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateSearchDialog, inquirer,
        {
          title: 'Quick Search',
          left: '0%',
          width: '100%',
          top: 65,
          textFieldMinimalWidth: 250,
          stripWhitespace: true,
          searchButtonTitle: '',
          searchButtonIcon: 'fly/blue/magnifying_glass_16x16.png',
          disableSuggestions: true,
          database: gazebo.fly.Contribution.FLYBASE_DB
        },
        {
          onOpen: { call: this.searchDialogOpenListener, context: this },
          onSearch: { call: this.quickSearchListener, context: this },
          // onInput: { call: this.inputListener, context: this },
          onTransitionCloseScreen: {
            call: inquirer.disposeSearchDialog,
            context: inquirer,
            parameters: {}
          }
        },
        {
          // prepareFileSuggestion: this.prepareSuggestion
        });

      this.generateStockListUI(inquirer);

      if (this.statusOpen)
        return;

      this.statusOpen = true;

      var linkContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
      var that = this;

      this.homeLink = new qx.ui.basic.Atom().set({
        label: 'Home',
        rich: true,
        icon: 'fly/gray_light/home_16x16.png'
      });
      this.homeLink.addListener('click', function(mouseEvent) {
        that.generateDashboardUI(that.inquirer);
        that.inquirer.suggestScreenTransition();
        that.selectedScreen = that.homeLink;
        that.highlightMenu();
      }, this);

      this.searchLink = new qx.ui.basic.Atom().set({
        label: 'Advanced Search',
        rich: true,
        icon: 'fly/gray_light/magnifying_glass_16x16.png'
      });
      this.searchLink.addListener('click', function(mouseEvent) {
        that.generateSearchUI(that.inquirer);
        that.inquirer.suggestScreenTransition();
        that.selectedScreen = that.searchLink;
        that.highlightMenu();
      }, this);

      this.addLink = new qx.ui.basic.Atom().set({
        label: 'Add Fly-Stock',
        rich: true,
        icon: 'fly/gray_light/plus_16x16.png'
      });
      this.addLink.addListener('click', function(mouseEvent) {
        this.stockInternalID = null;
        this.stockExternalID = null;
        this.stockSource = null;
        this.stockWildtypeName = null;
        this.stockContact = null;
        this.stockLabel = null;
        this.stockNotes = null;

        that.generateGenotypeInputUI(that.inquirer);
        that.inquirer.suggestScreenTransition();
        that.selectedScreen = that.addLink;
        that.highlightMenu();
      }, this);

      this.administrationLink = new qx.ui.basic.Atom().set({
        label: 'Groups & Users',
        rich: true,
        icon: 'fly/gray_light/cog_alt_16x16.png'
      });
      this.administrationLink.addListener('click', function(mouseEvent) {
        that.generateAdministrationUI(that.inquirer);
        that.inquirer.suggestScreenTransition();
        that.selectedScreen = that.administrationLink;
        that.highlightMenu();
      }, this);

      linkContainer.add(this.homeLink);
      linkContainer.add(this.searchLink);
      linkContainer.add(this.addLink);
      linkContainer.add(this.administrationLink);

      this.selectedScreen = this.homeLink;

      this.statusWidgets = [
        this.homeLink,
        this.searchLink,
        this.addLink,
        this.administrationLink
      ];

      var onMouseOver = function(mouseEvent) {
            if (this == that.selectedScreen) {
              return;
            }

            this.setTextColor('#333333');
            this.setBackgroundColor('#6694E3');
          };
      var onMouseOut = function(mouseEvent) {
            if (this == that.selectedScreen) {
              this.setTextColor('#333333');
              this.setBackgroundColor('#ffffff');
            } else {
              this.setTextColor('#ffffff');
              this.setBackgroundColor(null);
            }
          };

      this.highlightMenu();

      inquirer.openScreen(inquirer.generateStatusDisplay, inquirer,
        {
          title: ' ',
          userIcon: 'fly/gray_light/user_12x16.png',
          logoutIcon: 'fly/gray_light/eject_16x16.png',
          top: 0,
          left: '0',
          width: '100%',
          textColor: '#ffffff',
          backgroundColor: '#333333',
          customElements: this.statusWidgets,
          onMouseOver: onMouseOver,
          onMouseOut: onMouseOut,
          customElementPadding: [8, 12, 10, 12],
          customElementMargin: [0, 4, 0, 4]
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
        {
        });
    },

    generateGenotypeInputUI : function(inquirer, stockData) {

      this.stockData = stockData;
      this.numberOfBaskets = 10;

      var buttonContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({
        alignX: 'right'
      }));

      var startOverButton = new qx.ui.form.Button().set({
        label: 'Start Over',
        icon: 'fly/orange/x_alt_16x16.png'
      });

      startOverButton.addListener('click', function(e) {
        this.genotypeBasket.removeAllBasketItems();
        this.searchDialog.clear();
        this.searchDialog.makeHistory();
      }, this);

      buttonContainer.add(startOverButton);

      var proceedButton = new qx.ui.form.Button().set({
        label: '<b>Proceed with Metadata Entry</b>',
        icon: 'fly/blue/arrow_right_16x16.png',
        rich: true
      });

      proceedButton.addListener('click', this.proceedListener, this);

      buttonContainer.add(proceedButton);

      inquirer.openScreen(inquirer.generateTabbedInterface, inquirer,
        {
          top: 55,
          left: 0,
          width: '100%',
          createNewPageOn: [ 2 ],
          title: 'Add Fly-Stock',
          title0: 'Stock Entry',
          title2: 'Bulk Import',
          generatorCall0: inquirer.generateSearchDialog,
          generatorContext0: inquirer,
          parameters0: {
            title: 'Add Fly-Stock',
            left: inquirer.LEFT_SO_THAT_CENTERED,
            top: 55,
            stripWhitespace: true,
            keepHistory: true,
            searchButtonTitle: '',
            searchButtonIcon: 'fly/blue/plus_16x16.png',
            database: gazebo.fly.Contribution.FLYBASE_DB,
            container0: buttonContainer,
            position0: { row: 0, column: 4 }
          },
          listeners0: {
            onOpen: { call: this.searchDialogOpenListener, context: this },
            onSearch: { call: this.searchListener, context: this },
            onInput: { call: this.inputListener, context: this },
            onTransitionCloseScreen: {
              call: inquirer.disposeSearchDialog,
              context: inquirer,
              parameters: {}
            }
          },
          overrides0: {
            prepareFileSuggestion: this.prepareSuggestion
          },

          generatorCall1: inquirer.generateBasket,
          generatorContext1: inquirer,
          parameters1:
            {
              title: 'Genotype',
              // left: inquirer.LEFT_SO_THAT_CENTERED,
              footer: gazebo.fly.Contribution.FOOTER_PREAMBLE + '+',
              // top: 180,
              canProceedWithEmptyBasket: true, // For entering wild-type stocks.
              populate: this.numberOfBaskets,
              draggableItems: true,
              dragAndDropFlavour: 'genomic feature',
              hideProceedButton: true,
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
              decorations: [ 'group',
                        'group',
                        'group',
                        'group',
                        'group',
                        'group',
                        'group',
                        'group',
                        'group',
                        'group'
                       ]
            },
          listeners1:
            {
              onOpen: { call: this.inputBasketOpenListener, context: this },
              //onProceed: { call: this.proceedListener, context: this },
              onBasketChange: { call: this.basketChangeListener, context: this },
              onTransitionCloseScreen: {
                call: inquirer.disposeBasket,
                context: inquirer,
                parameters: {}
              }
            },
          overrides1:
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
            },
          generatorCall2: inquirer.generateCustomInterface,
          generatorContext2: inquirer,
          parameters2:
            {
              title: 'Stock Import',
              left: inquirer.LEFT_SO_THAT_CENTERED,
              top: 345,
              contents: new gazebo.fly.StockImport(
                {
                  inquirer: inquirer,
                  search: true
                },
                {
                  // TODO Define and implement the method..
                  onProceed: { call: this.stockImportListener, context: this }
                },
                {}
              )
            },
          listeners2:
            {
              onTransitionCloseScreen: {
                call: inquirer.disposeCustomInterface,
                context: inquirer,
                parameters: {}
              }
            },
          overrides2:
            {

            }
          },
          {
            onTransitionCloseScreen: {
              call: inquirer.disposeTabbedInterface,
              context: inquirer,
              parameters: {}
            }
          },
          {}
      );

    },

    // TODO Have to remove commas from baskets.
    generateSearchUI : function(inquirer) {

      this.numberOfBaskets = 6;

      inquirer.openScreen(inquirer.generateBasket, inquirer,
        {
          title: 'Genotype',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 155,
          width: 930,
          basketMinHeight: 110,
          canProceedWithEmptyBasket: true,
          populate: this.numberOfBaskets,
          draggableItems: true,
          dragAndDropFlavour: 'genomic feature',
          compact: true,
          titles: [ 'Chromosome X',
                    'Chromosome 2',
                    'Chromosome 3',
                    'Chromosome 4',
                    'Chromosome Y',
                    'Anywhere'
                  ],
          labels: [ 'X',
                    '2',
                    '3',
                    '4',
                    'Y',
                    'U'
                   ],
          decorations: [ 'group',
                    'group',
                    'group',
                    'group',
                    'group',
                    'group'
                   ],
          hideProceedButton: true
        },
        {
          onOpen: { call: this.searchBasketOpenListener, context: this },
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
          title: 'Advanced Search',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 55,
          stripWhitespace: true,
          searchButtonTitle: '',
          searchButtonIcon: 'fly/blue/plus_16x16.png',
          database: gazebo.fly.Contribution.FLYBASE_DB
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
          top: 345,
          contents: new gazebo.fly.GenotypeMetadata(
            {
              inquirer: inquirer,
              search: true
            },
            {
              onProceed: { call: this.advancedSearchListener, context: this }
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

    generateAdministrationUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateCustomInterface, inquirer,
        {
          title: 'Administration',
          left : inquirer.LEFT_SO_THAT_CENTERED,
          top: 60,
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

      inquirer.openScreen(inquirer.generateTabbedInterface, inquirer,
        {
          top: 155,
          left: '10%',
          right: '90%',
          createNewPageOn: [ 1 ],

          title: 'Stocklists',
          title0: 'My Stocks',
          title1: 'All Stocks',

          generatorCall0: inquirer.generateCustomInterface,
          generatorContext0: inquirer,
          parameters0:
            {
              title: 'My Stocks',
              left : inquirer.LEFT_SO_THAT_CENTERED,
//              top: 155,
//              maxHeight: 270,
              contents: new gazebo.fly.StockListViewer(
                {},
                {
                  onStockSelect: {
                    call: this.onStockSelectListener,
                    context: this
                  }
                },
                {}
              )
            },
          listeners0:
            {
              onTransitionCloseScreen: {
                call: inquirer.disposeCustomInterface,
                context: inquirer,
                parameters: {}
              }
            },
          overrides0:
            {

            },

          generatorCall1: inquirer.generateCustomInterface,
          generatorContext1: inquirer,
          parameters1:
            {
              title: 'All Stocks',
              left : inquirer.LEFT_SO_THAT_CENTERED,
//              top: 155,
//              maxHeight: 270,
              contents: new gazebo.fly.StockListViewer(
                {},
                {
                  onStockSelect: {
                    call: this.onStockSelectListener,
                    context: this
                  }
                },
                {}
              )
            },
          listeners1:
            {
              onTransitionCloseScreen: {
                call: inquirer.disposeCustomInterface,
                context: inquirer,
                parameters: {}
              }
            },
          overrides1:
            {

            }
          },

          {
            onTransitionCloseScreen: {
              call: inquirer.disposeTabbedInterface,
              context: inquirer,
              parameters: {}
            }
          },
          {}
      );

    },

    generateSearchResultUI : function(inquirer, searchQuery) {

      inquirer.openScreen(inquirer.generateCustomInterface, inquirer,
        {
          title: 'Search Results',
          left : inquirer.LEFT_SO_THAT_CENTERED,
          top: 55,
          maxHeight: 630,
          contents: new gazebo.fly.StockListViewer(
            searchQuery,
            {
              onStockSelect: {
                call: this.onStockSelectListener,
                context: this
              }
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

    generateMetaDataUI : function(inquirer) {

      inquirer.openScreen(inquirer.generateCustomInterface, inquirer,
        {
          title: 'Genotype',
          left : inquirer.LEFT_SO_THAT_CENTERED,
          top: 55,
          contents: new gazebo.fly.GenotypeViewer(
            {
              height: 106,
              footer: gazebo.fly.Contribution.FOOTER_PREAMBLE + this.getFlyBaseNotation()
            },
            {},
            {}
          )
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
          top: 225,
          contents: new gazebo.fly.GenotypeMetadata(
            {
              inquirer: inquirer,
              // TODO 10 hardcoded..
              genotype: new gazebo.fly.GenotypeWriter().stringNotation(this.getChromosomes(10)),
              genotypeHistory: this.getGenotypeHistory(),
              internalID: this.stockInternalID,
              externalID: this.stockExternalID,
              source: this.stockSource,
              wildtypeName: this.stockWildtypeName,
              contact: this.stockContact,
              label: this.stockLabel,
              notes: this.stockNotes
            },
            {
              onOpen: { call: this.metadataEditorOpenListener, context: this },
              onProceed: { call: this.metadataEditorSaveListener, context: this }
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

    globulesDissolved : function() {
      //alert('this ' + this + ' - ' + this.bulkGenotypes + ' - ' + this.getChromosomes(10));
      if (this.bulkGenotypes > 0) {
        this.debug('GLOBULES DISSOLVED');
        this.debug('GENOTYPE: ' + new gazebo.fly.GenotypeWriter().stringNotation(this.getChromosomes(10)));

        this.genotypeBasket.removeAllBasketItems();
        
        this.bulkGenotypes -= 1;
        this.progressBar.setValue(this.bulkGenotypes);

        if (this.bulkGenotypes > 0)
          this.fireDataEvent('proceedRelay', 'eve ena', null);
      }
    },

    stockImportListener : function(dataEvent) {
      if (this.progressBar == null) {
        this.addListener("proceedRelay", this.stockImportListener, this);

        var max = 10;
        this.progressBar = new qx.ui.indicator.ProgressBar(max, max);

        var window = new qx.ui.window.Window().set({
          layout: new qx.ui.layout.VBox(10)
        });
        window.add(this.progressBar);
        window.open();

        this.bulkGenotypes = max;
      }
      var genotype = dataEvent.getData();

      this.searchDialog.searchForItem(genotype);
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

      // If we already know then internal stock-ID, well, then don't update it.
      if (this.stockInternalID) {
        return;
      }

      var rpc = new qx.io.remote.Rpc();
			rpc.setTimeout(gazebo.Application.timeout);
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
        gazebo.fly.Contribution.FLYBASE_DB,
        "x_stocks",
        [ "xref", "genotype", "description", "donor", "contact", "wildtype", "history" ],
        [ "", "", "", "", "", "", "" ]
      );
    },

    metadataEditorSaveListener : function() {
      this.generateDashboardUI(this.inquirer);
      this.inquirer.suggestScreenTransition();
    },

    onStockSelectListener : function(dataEvent) {
      var stockID = dataEvent.getData();

      //alert('ID: ' + stockID);

      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(gazebo.Application.delayedTimeout);
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      var that = this;
      this.rpcRunning = rpc.callAsync(
        function(result, ex, id)
        {
          if (result && result.length > 0) {
            that.generateGenotypeInputUI(that.inquirer, result[0]);
            that.inquirer.suggestScreenTransition();
          }
        },
        "query_data",
        {},
        gazebo.fly.Contribution.FLYBASE_DB,
        [ '*' ],
        [ "x_stocks s" ],
        's.id == ?',
        [ stockID ]
      );
    },

    // TODO The listener gets called twice.. for *some* reason. As a
    // workaround, this.stockData is set to 'null' below, so that the
    // baskets are not populated twice.
    searchDialogOpenListener : function(dataEvent)
    {
      this.searchDialog = dataEvent.getData();

      this.debug('SEARCH DIALOG IS ' + this.searchDialog);
      
      // It is important that the baskets are set-up beforehand!
      if (this.stockData) {
        var genotype = this.stockData[3];

        this.stockInternalID = this.stockData[0];
        this.stockExternalID = this.stockData[2];
        this.stockSource = this.stockData[6];
        this.stockWildtypeName = this.stockData[8];
        this.stockContact = this.stockData[7];
        this.stockLabel = this.stockData[4];
        this.stockNotes = this.stockData[5];

        this.requestTransition = true;
        this.stockData = null;
        this.searchListener(new qx.event.type.Data().init([null, genotype, null]));
      }
    },

    inputBasketOpenListener : function(dataEvent)
    {
      this.genotypeBasket = dataEvent.getData();
      this.showCommas = true;
    },

    searchBasketOpenListener : function(dataEvent)
    {
      this.genotypeBasket = dataEvent.getData();
      this.showCommas = false;
    },

    getChromosomes : function(maxBaskets)
    {
      var chromosomes = new Array(6);

      for (var x = 0; x < chromosomes.length; x++) {
        chromosomes[x] = [];
      }

      for (x = 0; x < maxBaskets; x++) {
        var items = this.genotypeBasket.getBasketItems(x);
        var bag = new Array();

        for (var y = 0; y < items.length; y++) {
          var labels = items[y].getChildren();

          for (var z = 0; z < labels.length; z++) {
            if (labels[z].plainModel)
              bag.push(labels[z]);
          }
        }

        if (x < 6) {
          chromosomes[x].push(bag);
        } else {
          chromosomes[x % 6].push(bag);
        }
      }

      return chromosomes;
    },

    getGenotypeHistory : function()
    {
      var historyString = '';
      var history = this.searchDialog.getHistory();

      for (var i = 0; i < history.length; i++) {
        historyString += history[i] + "\n";
      }

      return historyString;
    },

    getFlyBaseNotation : function()
    {
      var writer = new gazebo.fly.GenotypeWriter();

      // Assuming 10 baskets, i.e. stock input.
      // Aww.. to hardcode or not to hardcode.. that is the question..
      return writer.flybaseNotation(this.getChromosomes(10));
    },

    basketChangeListener : function(dataEvent)
    {
      this.genotypeBasket.setFooter(gazebo.fly.Contribution.FOOTER_PREAMBLE +
        this.getFlyBaseNotation()
      );
    },

    proceedListener : function()
    {
      this.generateMetaDataUI(this.inquirer);
      this.inquirer.suggestScreenTransition();
    },

    searchListener : function(dataEvent)
    {
      this.requestTransition = true;
      this.inputListener(dataEvent);
    },

    quickSearchListener : function(dataEvent)
    {
      var compound = dataEvent.getData();
      var treeItem = compound[0];
      var userInput = compound[1];
      var reQuery = compound[2];

      this.generateSearchResultUI(this.inquirer, { searchTerm: userInput });
      this.inquirer.suggestScreenTransition();
    },

    advancedSearchListener : function()
    {
      // Assuming 6 baskets, i.e. advanced search.
      var chromosomes = this.getChromosomes(6);
      var constraints = {}

      for (var i = 0; i < chromosomes.length; i++) {
        var chromosome = chromosomes[i];

        // TODO Hack, looks at the last entry only at the moment.
        for (var j = 0; j < chromosome.length; j++) {
          if (chromosome[j][0].plainModel) {
            constraints['searchChromosome' + i] = chromosome[j][0].plainModel;
          }
        }
      }

      this.generateSearchResultUI(this.inquirer, constraints);
      this.inquirer.suggestScreenTransition();
    },

    inputListener : function(dataEvent)
    {
      var compound = dataEvent.getData();
      var treeItem = compound[0];
      var userInput = compound[1];
      var reQuery = compound[2];
      var initialParameters = dataEvent.getOldData();

      // '+' should be ignored. It is only there to denote
      // an unambiguous genotype:
      if (userInput == '+') {
        if (this.globules) {
          this.globules -= 1;
          this.debug('!!! GLOBULES: ' + this.globules);
          if (this.globules <= 0)
            this.globulesDissolved();
        }
        return;
      }

      var suggestedAides = compound.length > 2 ? compound[2] : null;

      var chromosome = 5 // Default placement: chromosome 'Unknown'
      var chromosomeName = 'Unknown'
      var flybaseId = null;

      if (treeItem) {
        if (userInput) {
          this.debug('INPUT LISTENER: Item: ' + treeItem + ' / ' + userInput);
        } else {
          this.debug('INPUT LISTENER: Item: ' + treeItem + ' / null');
        }
      } else {
        if (userInput) {
          this.debug('INPUT LISTENER: Item: null / ' + userInput);
        } else {
          this.debug('INPUT LISTENER: Item: null / null');
        }
      }

      if (treeItem) {
        var parameters = treeItem.model_workaround[0];

        if (reQuery) {
          if (parameters && !parameters[3]) {
            for (var i = 1; i < treeItem.model_workaround.length && !parameters[3]; i++) {
              parameters = treeItem.model_workaround[i];
            }
          }

          if (initialParameters && parameters) {
            parameters[0] = initialParameters[0];
            parameters[1] = initialParameters[1];
            parameters[2] = initialParameters[2];
            parameters[5] = initialParameters[5];
            parameters[6] = initialParameters[6];

            treeItem.model_workaround = parameters;
          } else {
            if (parameters) {
              parameters[0] = null;
              parameters[1] = null;
              parameters[2] = null;
              parameters[5] = null;
              parameters[6] = null;
            } else {
              parameters = [null, null, null, 'U', null, null, null];
            }

            treeItem.model_workaround = parameters;
          }
        }

        var bottom = treeItem.annotation ? treeItem.annotation[0] : false;

        if (parameters[5] && parameters[5].match("^FB.+")) {
          flybaseId = parameters[5];

          // Put balancers on the bottom chromosome -- if entered alone.
          if (!bottom &&
              this.numberOfBaskets == 10 &&
              !treeItem.annotation &&
              flybaseId.match("^FBba.+")) {
            bottom = true;
          }
        }

        chromosomeName = parameters[3].charAt(0);

        if (chromosomeName == 'X') { chromosome = bottom ? 6 : 0; }
        else if (chromosomeName == 'Y') { chromosome = 4; }
        else if (chromosomeName == '2') { chromosome = bottom ? 7 : 1; }
        else if (chromosomeName == '3') { chromosome = bottom ? 8 : 2; }
        else if (chromosomeName == '4') { chromosome = bottom ? 9 : 3; }
        else { chromosomeName = 'Unknown'; chromosome = 5; }

        // Check if the feature that we are inserting is already
        // in the top-chromosome. If so, put it onto the bottom.
        // Example: you enter 'w' twice and get a homozygous X chr.
        if (!bottom && this.numberOfBaskets == 10 && chromosome < 4) {
          var currentChromosomes = this.getChromosomes(10);

          for (i = 0; i < 4; i++) {
            var topChromosome = currentChromosomes[i][0];

            for (var j = 0; j < topChromosome.length; j++) {
              if (topChromosome[j].plainModel == userInput) {
                chromosome += 6;
                break;
              }
            }

            if (chromosome > 3) {
              break;
            }
          }
        }

        // If the feature is on Y or U, then make sure we do not put it
        // there twice. This is important whenever a genotype is entered,
        // because for each feature of the genotype it is assumed that there
        // are two chromosomes available and hence the feature strings are
        // doubled by default.
        if (this.numberOfBaskets == 10 && chromosome >= 4 && chromosome <= 5) {
          var thisChromosome = this.getChromosomes(10)[chromosome][0];

          for (j = 0; j < thisChromosome.length; j++) {
            if (thisChromosome[j].plainModel == userInput) {
              if (this.globules) {
                this.globules -= 1;
                this.debug(']]] GLOBULES: ' + this.globules);
                if (this.globules <= 0)
                  this.globulesDissolved();
              }
              return;
            }
          }
        }
      }

      if (userInput.length > 0 && this.requestTransition) {
        this.requestTransition = false;

        // Eliminate leading and trailing white space:
        userInput = userInput.replace(/^\s+|\s+$/g, "");

        // Allels may require re-querying, so fake a genotype:
        if (!this.busyBee && userInput.match(/^\w+\[\w+|\*\]$/)) {
          userInput = userInput + ' / ';
        }

        // Simple test to see whether a complete genotype might have been entered:
        if (!this.reader.isAtom(userInput)) {
          var chromosomes = this.reader.decompose(userInput);

          this.busyBee = true;
          this.globules = 0;

          while (chromosomes.length > 0) {
            var chromosomeBag = chromosomes.shift();
            bottom = false;

            // Is this a partite bag?
            var partite = false;
            var possibleBalancer = '-';
            for (i = 0; i < chromosomeBag.length; i++) {
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
            if (!partite && this.numberOfBaskets == 10) {
              this.debug("DOUBLE IT");
              chromosomeBag = chromosomeBag.concat([ '/' ].concat(chromosomeBagDuplicate));
            }

            var position = 0;
            while (chromosomeBag.length > 0) {
              var token = chromosomeBag.shift();
              var comma = false;

              if (token == '/') {
                if (this.numberOfBaskets != 10)
                  continue;
                
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

                // Note: Do this before the token itself is removed
                // from the aides, because it may reveal information about
                // its own location.
                for (i = 0; i < aides.length; i++) {
                  // Check for inversions or deficiencies and use them
                  // to obtain absolute chromosomal positions.
                  if (aides[i].match(/^(In|Df)\(\d[LR]{0,2}\).*/)) {
                    var chromosomeLetter = aides[i].match(/\(\d[LR]{0,2}\)/)[0].match(/\d/);

                    // The following genes (w, b, e and ci) appear on the
                    // chromosomes X, 2, 3 and 4 respectively, hence, will
                    // aide the positioning of the inversion/deficiency.
                    if (chromosomeLetter == '1') {
                      aides = aides.concat([ 'w' ]);
                    } else if (chromosomeLetter == '2') {
                      aides = aides.concat([ 'b' ]);
                    } else if (chromosomeLetter == '3') {
                      aides = aides.concat([ 'e' ]);
                    } else if (chromosomeLetter == '4') {
                      aides = aides.concat([ 'ci' ]);
                    } // There are no In/Df on Y (FB2010_05)
                  }

                  // If we are dealing with a simple symbol + superscript, then
                  // treat it as an allele and give the gene here as an aide.
                  if (aides[i].match(/^\w+\[\w+|\*\]$/)) {
                    var geneSymbol = aides[i].match(/^\w+/)[0];

                    aides = aides.concat([ geneSymbol ]);
                  }
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
                this.globules += 1;
                this.searchDialog.searchForItem(token, [bottom, comma, position], aides, 3);
                position++;
              } else {
                this.debug('TOKEN IGNORED: ' + token + " (" + possibleBalancer + ")");
              }
            }
          }

          return;
        } else {
          // Else-path: We are seeing an atom here.

          // Find annotations in flystockdb-notation:
          var hint = userInput.match(/^@[^@]+@/);

          this.debug('HINT: ' + hint + ' on ' + userInput);
          if (hint) {
            var flybaseIdHint = userInput.match(/^@\w*:/)[0].match(/\w+/);
            var chromosomeHint = userInput.match(/\$\d+@$/);
            bottom = treeItem.annotation ? treeItem.annotation[0] : false;

            if (flybaseIdHint) {
              flybaseId = flybaseIdHint[0];
            }

            if (chromosomeHint) {
              chromosome = parseInt(chromosomeHint[0].match(/\d+/)[0]);

              if (bottom && chromosome < 4) {
                chromosome += 6;
              }
            }

            userInput = userInput.replace(/^@\w*:/, '').replace(/\$\d+@$/, '');
          }

          // In case the feature is put on Unknown:
          // Check for inversions or deficiencies which may
          // contain information about their own location.
          if (chromosome == 5 && userInput.match(/^(In|Df)\(\d[LR]{0,2}\).*/)) {
            chromosomeLetter = userInput.match(/\(\d[LR]{0,2}\)/)[0].match(/\d/);

            if (chromosomeLetter == '1') {
              chromosome = 0;
            } else if (chromosomeLetter == '2') {
              chromosome = 1;
            } else if (chromosomeLetter == '3') {
              chromosome = 2;
            } else if (chromosomeLetter == '4') {
              chromosome = 3;
            } // Not known what an In/Df would be named on Y.
          }
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
          label.setDroppable(true);
          label.addListener('drop', function(e) {
            e.stopPropagation();
          });
          label.addListener('dragover', function(e) {
            e.preventDefault();
          });

          label.flybaseModel = flybaseId;
          label.plainModel = displayText;
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

          label.plainModel = displayText;
        }

        var dndHandle = new qx.ui.basic.Atom(null, 'fly/black/move_8x8.png');

        dndHandle.setDraggable(true);
        dndHandle.addListener("dragstart",
          function(e) {
            e.addType('genomic feature');
            e.addAction('move');
            e.addData('genomic feature', container);
          }
        );

        container.add(dndHandle);

        label.setToolTipText(userInput);

        var commaSwitch = new qx.ui.basic.Label().set({
          value: '<b style="color: #888;">,</b>',
          rich: true,
          textAlign: 'center',
          width: 12,
          height: 18
        });

        commaSwitch.isCommaSwitch = true;
        commaSwitch.isSwitchedOn = false;
        label.commaSwitchedOn = false;

        if (treeItem && treeItem.annotation ? treeItem.annotation[1] : false) {
          commaSwitch.setValue('<b style="color: #000;">,</b>');
          commaSwitch.isSwitchedOn = true;
          label.commaSwitchedOn = true;
        }

        var that = this;

        commaSwitch.addListener('click', function(mouseEvent) {
          if (this.getValue() == '<b style="color: #888;">,</b>') {
            this.setValue('<b style="color: #000;">,</b>');
            commaSwitch.isSwitchedOn = true;
            label.commaSwitchedOn = true;
            that.basketChangeListener(null);
          } else {
            this.setValue('<b style="color: #888;">,</b>');
            commaSwitch.isSwitchedOn = false;
            label.commaSwitchedOn = false;
            that.basketChangeListener(null);
          }
        }, commaSwitch);

        commaSwitch.addListener('mouseover', function(mouseEvent) {
          this.setDecorator('button-box-hovered');
        }, commaSwitch);
        commaSwitch.addListener('mousedown', function(mouseEvent) {
          this.setDecorator('button-box-pressed');
        }, commaSwitch);
        commaSwitch.addListener('mouseup', function(mouseEvent) {
          this.setDecorator('button-box-hovered');
        }, commaSwitch);
        commaSwitch.addListener('mouseout', function(mouseEvent) {
          this.setDecorator(null);
        }, commaSwitch);

        container.add(label);

        // TODO commaSwitch objects should not be created when not used..
        if (this.showCommas) {
          container.add(commaSwitch);
        }

        // In case the input cannot be put on a chromosome, it goes onto
        // the 'Unknown' chromosome without any particular ordering.
        var weight = treeItem && treeItem.annotation ? treeItem.annotation[2] : null;

        this.genotypeBasket.addBasketItem(chromosome, container, weight);

        this.debug('X');
        this.debug('----> ' + this.searchDialog);
        this.searchDialog.clear();
        this.debug('Y');

        this.globules -= 1;
        this.debug('>>> GLOBULES: ' + this.globules);
        if (this.globules <= 0)
          this.globulesDissolved();
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
      } else if (parameters[2] == 'transposable_element_insertion_site') {
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
