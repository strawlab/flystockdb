/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************

#asset(gazebo/*)
#asset(qx/icon/Oxygen/64/actions/dialog-ok.png)

#asset(qx/icon/Oxygen/16/actions/edit-delete.png)
#asset(qx/icon/Oxygen/16/actions/help-about.png)
#asset(qx/icon/Oxygen/16/actions/go-next.png)
#asset(qx/icon/Oxygen/16/actions/go-previous.png)

#asset(qx/icon/Oxygen/16/actions/list-add.png)

#asset(qx/icon/Oxygen/16/categories/development.png)

************************************************************************ */

qx.Class.define("gazebo.Application",
{
  extend : qx.application.Standalone,

	statics :
	{
    LEFT_SO_THAT_CENTERED : -1,
    TOP_SO_THAT_CENTERED : -1,

		// Hostname of the application's server
		hostname : qx.core.Setting.get("gazebo.server.hostname"),
		// HTTP port on the application's server, which might be null
		port : qx.core.Setting.get("gazebo.server.port"),

		// Generates the application's server URL
		getServerURL : function()
		{
			if (this.port) {
				return "http://" + this.hostname + ":" + this.port + "/gazebo.cgi";
			} else {
				return "http://" + this.hostname + "/gazebo.cgi";
			}
		}
	},

  members :
  {
    openingScreens : new Array(),
    closingScreens : new Array(),

    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      //if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }
						
			// Remember how to work with tables for later...
			// var tableModel = new qx.ui.table.model.Simple();			
			// tableModel.setColumns(['a', 'b']);
			// tableModel.setData([['abc', 'sdfsd'],['def', 'wefew']]);
			// var table = new qx.ui.table.Table(tableModel);
			// table.set({ width: 300, height: 200, decorator: null });
			// tableWindow.add(table);
			// table.updateContent();

			// this.generateConnectionDialog();
			// this.generateAuthenticationDialog();

      var contributionArray = null;
      try {
        contributionArray = qx.core.Setting.get("gazebo.contributions");
      }
      catch(e) {}
      if (contributionArray) {
        for (var i = 0; i < contributionArray.length; i++) {
          this.debug("Inspecting contribution: " + contributionArray[i]);
          this.validateAndLoadContribution(contributionArray[i]);
        }
      }
    },

    validateAndLoadContribution : function(classname)
    {
      if (qx.Class.isDefined(classname) == false) {
        return;
      }

      var contributionClass = qx.Class.getByName(classname);

      if (!qx.Class.hasInterface(contributionClass, gazebo.IDelegator)) {
        return;
      }

      this.contributionInstance = new contributionClass();

      this.contributionName = this.contributionInstance.registerContributionName();
      qx.bom.History.getInstance().addToHistory("welcome", this.contributionName);

      this.contributionInstance.registerInitialScreen(this);
      this.screenTransition();
    },

    getPositioningFunction : function(left, top)
    {
      return function() {
        var parent = this.getLayoutParent();

        if (parent) {
          var bounds = parent.getBounds();

          if (bounds) {
            var hint = this.getSizeHint();

            if (left == this.LEFT_SO_THAT_CENTERED) {
              left = Math.round((bounds.width - hint.width) / 2);
            }

            if (top == this.TOP_SO_THAT_CENTERED) {
              top = Math.round((bounds.height - hint.height) / 2);
            }

            this.moveTo(left, top);
          }
        }
      };
    },

		generateAuthenticationDialog : function()
		{
			var authenticationDialog = new gazebo.ui.ConnectionDialog(false, true);
			authenticationDialog.addListener("connect", this.establishConnection, this);

			this.authenticationWindow = new qx.ui.window.Window("Authentication");
			this.authenticationWindow.setLayout(new qx.ui.layout.HBox(10));
			this.authenticationWindow.add(authenticationDialog);
			this.authenticationWindow.setResizable(false, false, false, false);
			this.authenticationWindow.setMovable(false);
			this.authenticationWindow.setShowClose(false);
			this.authenticationWindow.setShowMaximize(false);
			this.authenticationWindow.setShowMinimize(false);

			this.authenticationWindow.addListener("resize", this.authenticationWindow.center, this.authenticationWindow);

			this.authenticationWindow.open();
      this.getRoot().add(this.authenticationWindow);
		},

    disposeAuthenticationDialog : function()
    {
      this.authenticationWindow.close();
    },

		generateConnectionDialog : function()
		{
			var connectionDialog = new gazebo.ui.ConnectionDialog(true, false);
			connectionDialog.addListener("connect", this.establishConnection, this);

			this.connectionWindow = new qx.ui.window.Window("Database Connection");
			this.connectionWindow.setLayout(new qx.ui.layout.HBox(10));
			this.connectionWindow.add(connectionDialog);
			this.connectionWindow.setResizable(false, false, false, false);
			this.connectionWindow.setMovable(false);
			this.connectionWindow.setShowClose(false);
			this.connectionWindow.setShowMaximize(false);
			this.connectionWindow.setShowMinimize(false);

			this.connectionWindow.addListener("resize", this.connectionWindow.center, this.connectionWindow);

      this.connectionWindow.open();      
      this.getRoot().add(this.connectionWindow);
		},

    disposeConnectionDialog : function()
    {
      this.connectionWindow.close();
    },

    // Only for testing purposes, yet.
    generateLogo : function(parameters, listeners)
    {
      this.getRoot().add(new qx.ui.form.Button(null, "qx/icon/Oxygen/64/actions/dialog-ok.png"));
    },

    disposeLogo : function()
    {
    },

    disposeButton : function()
    {
    },

    generateSearchDialog : function(parameters, listeners, overrides)
    {
      var searchDialog = new gazebo.ui.SuggestionTextField(parameters, listeners, overrides);
      
      var title = parameters['title'];
      var left = parameters['left'];
      var top = parameters['top'];
      
      if (parameters['stripWhitespace']) {
        searchDialog.setStripWhitespace(parameters['stripWhitespace']);
      }

      this.searchWindow = new qx.ui.window.Window(title ? title : "Search");
      this.searchWindow.setMaxWidth(500);
      this.searchWindow.setLayout(new qx.ui.layout.HBox(10));
      this.searchWindow.add(searchDialog);
      this.searchWindow.setResizable(false, false, false, false);
			this.searchWindow.setMovable(false);
			this.searchWindow.setShowClose(false);
			this.searchWindow.setShowMaximize(false);
			this.searchWindow.setShowMinimize(false);

      this.searchWindow.addListenerOnce("resize", this.getPositioningFunction(left, top), this.searchWindow);

      this.searchWindow.open();
      this.getRoot().add(this.searchWindow);
    },

    disposeSearchDialog : function()
    {
      this.searchWindow.close();
      this.searchWindow.destroy();
    },

    generateBasket : function(parameters, listeners, overrides)
    {
      this.basketContainer = new gazebo.ui.BasketContainer(parameters, listeners, overrides);

      var title = parameters['title'];
      var left = parameters['left'];
      var top = parameters['top'];

      this.basketWindow = new qx.ui.window.Window(title ? title : "Basket");
      this.basketWindow.setLayout(new qx.ui.layout.HBox(5));
      this.basketWindow.setResizable(false, false, false, false);
			this.basketWindow.setMovable(false);
			this.basketWindow.setShowClose(false);
			this.basketWindow.setShowMaximize(false);
			this.basketWindow.setShowMinimize(false);

      this.basketWindow.addListener("resize", this.getPositioningFunction(left, top), this.basketWindow);

      this.basketWindow.add(this.basketContainer);
      this.basketWindow.add(new qx.ui.toolbar.Separator());

      var proceedButton = new qx.ui.form.Button(null, "icon/64/actions/dialog-ok.png");
      this.basketWindow.add(proceedButton);

      this.basketWindow.open();
      this.getRoot().add(this.basketWindow);


      if (listeners['onOpen']) {
        listener = listeners['onOpen'];
        this.addListener('openRelay', listener['call'], listener['context']);
      }
      this.fireDataEvent('openRelay', this.basketContainer);
    },

    setBasketItem : function(index, item)
    {
      this.basketContainer.setBasketItem(index, item);
    },

    disposeBasket : function()
    {
      // ...
    },

		generateDatabaseInterface : function()
		{
			this.dbComposite = new qx.ui.container.Composite();
			this.dbComposite.setLayout(new qx.ui.layout.Canvas());
			this.dbComposite.setPadding(5, 5, 5, 5);
			
			this.wfComposite = new qx.ui.container.Composite();
			this.wfComposite.setLayout(new qx.ui.layout.Canvas());
			this.wfComposite.setPadding(5, 5, 5, 5);
			
			this.databaseWindow = new qx.ui.window.Window("Databases");
			this.databaseWindow.setLayout(new qx.ui.layout.HBox(10));
			this.databaseWindow.setResizable(false, false, false, false);
			this.databaseWindow.setMovable(false);
			this.databaseWindow.setShowClose(false);
			this.databaseWindow.setShowMaximize(false);
			this.databaseWindow.setShowMinimize(false);

			this.databaseWindow.add(new qx.ui.tree.Tree(), { width: "100%" });

			this.workflowWindow = new qx.ui.window.Window("Workflow");
			this.workflowWindow.setLayout(new qx.ui.layout.HBox(10));
			this.workflowWindow.setResizable(false, false, false, false);
			this.workflowWindow.setMovable(false);
			this.workflowWindow.setShowClose(false);
			this.workflowWindow.setShowMaximize(false);
			this.workflowWindow.setShowMinimize(false);

			this.dbComposite.add(this.databaseWindow, { left: "0%", top: "0%", right: "0%", bottom: "0%" });
			this.wfComposite.add(this.workflowWindow, { left: "0%", top: "0%", right: "0%", bottom: "0%" });
			this.getRoot().add(this.dbComposite, { left: "0%", top: "0%", right: "75%", bottom: "0%" });
			this.getRoot().add(this.wfComposite, { left: "80%", top: "0%", right: "0%", bottom: "0%" });
			this.databaseWindow.open();
			this.workflowWindow.open();
		},

		establishConnection : function(dataEvent)
		{
      alert("Msg: " + dataEvent.getData());
      this.fireEvent("screen.close", null);
			this.contributionInstance.registerNextScreen(this);
      this.fireEvent("screen.open", null);
		},

    suggestScreenTransition : function()
    {
      // No intervention or post-poning yet.
      this.screenTransition();
    },

    screenTransition : function()
    {
      var screenParams;

      for (i = 0; i < this.closingScreens.length; i++) {
        screenParams = this.closingScreens[i];

        screenParams['context'].anonymousMethod = screenParams['call'];
        screenParams['context'].anonymousMethod(screenParams['parameters']);
      }

      for (i = 0; i < this.openingScreens.length; i++) {
        screenParams = this.openingScreens[i];

        screenParams['context'].anonymousMethod = screenParams['call'];
        screenParams['context'].anonymousMethod(
          screenParams['parameters'],
          screenParams['listeners'],
          screenParams['overrides']
        );
      }

      qx.lang.Array.removeAll(this.closingScreens);
      qx.lang.Array.removeAll(this.openingScreens);

      this.contributionInstance.registerNextScreen(this);
    },

    openScreen : function(call, context, parameters, listeners, overrides)
    {
      this.openingScreens.push(
        {
          call: call,
          context: context,
          parameters: parameters,
          listeners: listeners,
          overrides: overrides
        });
    },

    closeScreen : function(call, context, parameters)
    {
      this.closingScreens.push(
        {
          call: call,
          context: context,
          parameters: parameters
        });
    }
  }
});
