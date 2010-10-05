/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************

#asset(gazebo/*)
#asset(qx/icon/Oxygen/16/actions/dialog-ok.png)
#asset(qx/icon/Oxygen/64/actions/dialog-ok.png)

#asset(qx/icon/Oxygen/16/actions/edit-delete.png)
#asset(qx/icon/Oxygen/16/actions/help-about.png)
#asset(qx/icon/Oxygen/16/actions/go-next.png)
#asset(qx/icon/Oxygen/16/actions/go-previous.png)

#asset(qx/icon/Oxygen/22/actions/go-next.png)
#asset(qx/icon/Oxygen/22/actions/go-previous.png)

#asset(qx/icon/Oxygen/16/actions/go-home.png)
#asset(qx/icon/Oxygen/16/actions/edit-find.png)
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

    authenticationDispatcherSurrogate : new qx.core.Object(),

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

    generateStatusDisplay : function(parameters, listeners, overrides)
    {
      var title = parameters['title'];
      var left = parameters['left'];
      var top = parameters['top'];
      var customElements = parameters['customElements'];

      this.statusWindow = new qx.ui.window.Window(title ? title : "Status");
      this.statusWindow.setMinWidth(150);
      this.statusWindow.setMaxWidth(500);
      this.statusWindow.setLayout(new qx.ui.layout.HBox(10).set({
        alignY: 'middle'
      }));
      this.statusWindow.setResizable(false, false, false, false);
			this.statusWindow.setMovable(false);
			this.statusWindow.setShowClose(false);
			this.statusWindow.setShowMaximize(false);
			this.statusWindow.setShowMinimize(false);

      this.statusWindow.addListenerOnce("resize", this.getPositioningFunction(left, top), this.statusWindow);

      this.statusDisplayUsername = new qx.ui.basic.Label().set({
        value: '-',
        rich: true
      });
      this.statusDisplayAuthenticationLink = new qx.ui.basic.Label().set({
        value: '<u>Logout</u>',
        rich: true
      });

      that = this;
      this.statusDisplayAuthenticationLink.addListener('click', function(mouseEvent) {
        that.contributionInstance.generateLogoutUI(that);
        that.suggestScreenTransition();
      }, this);

      // Placement of additional elements
      if (customElements) {
        this.statusWindow.add(customElements);
        this.statusWindow.add(new qx.ui.basic.Label().set({
          value: " | ",
          rich: true
        }));
      }

      this.statusWindow.add(this.statusDisplayUsername);
      this.statusWindow.add(new qx.ui.basic.Label().set({
        value: " | ",
        rich: true
      }));
      this.statusWindow.add(this.statusDisplayAuthenticationLink);

      this.statusWindow.open();
      this.getRoot().add(this.statusWindow);

      this.generateAuthenticationDispatcher(
        {},
        {
          'onAuthenticationSuccess': { call: this.updateStatusDisplay, context: this },
          'onAuthenticationFailure': { call: this.updateStatusDisplay, context: this }
        },
        {});
    },

    updateStatusDisplay : function(dataEvent)
    {
      var status = dataEvent.getData();

      if (status && status['logged_in']) {
        this.statusDisplayUsername.setValue(status['username']);
      } else {
        qx.lang.Array.removeAll(this.openingScreens);
        this.contributionInstance.generateLoginUI(this);
        this.suggestScreenTransition();
      }
    },

    disposeStatusDisplay : function(parameters)
    {
      this.statusWindow.close();
      this.statusWindow.destroy();
    },

    generateAuthenticationDispatcher : function(parameters, listeners, overrides)
    {
      var logout = parameters['logout'];

      if (listeners['onAuthenticationSuccess']) {
        listener = listeners['onAuthenticationSuccess'];
        this.authenticationDispatcherSurrogate.addListenerOnce('onAuthenticationSuccessRelay', listener['call'], listener['context']);
      }
      if (listeners['onAuthenticationFailure']) {
        listener = listeners['onAuthenticationFailure'];
        this.authenticationDispatcherSurrogate.addListenerOnce('onAuthenticationFailureRelay', listener['call'], listener['context']);
      }

      var rpc = new qx.io.remote.Rpc();
				rpc.setTimeout(2000); // 2sec time-out, arbitrarily chosen.
				rpc.setUrl(gazebo.Application.getServerURL());
				rpc.setServiceName("gazebo.cgi");

				var that = this;
				this.RpcRunning = rpc.callAsync(
					function(result, ex, id)
					{
            if (that.RpcRunning) {
              that.RpcRunning = null;
              if (ex) {
                // TODO
                return;
              }
              if (!result) {
                // TODO
                return;
              }
              if (result['logged_in']) {
                that.authenticationDispatcherSurrogate.fireDataEvent("onAuthenticationSuccessRelay", result);
              } else {
                that.authenticationDispatcherSurrogate.fireDataEvent("onAuthenticationFailureRelay", result);
              }
            }
					},
					logout ? "disconnect" : "status"
				);
    },

    disposeAuthenticationDispatcher : function(parameters)
    {
      this.authenticationDispatcherSurrogate = new qx.core.Object();
    },

		generateConnectionDialog : function(parameters, listeners, overrides)
		{
      var title = parameters['title'];

			var connectionDialog = new gazebo.ui.ConnectionDialog(parameters, listeners, overrides);
			connectionDialog.addListener("connect", this.establishConnection, this);

			this.connectionWindow = new qx.ui.window.Window(title ? title :"Database Connection");
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

    disposeConnectionDialog : function(parameters)
    {
      this.connectionWindow.close();
      this.connectionWindow.destroy();
    },

    // Only for testing purposes, yet.
    generateLogo : function(parameters, listeners, overrides)
    {
      this.getRoot().add(new qx.ui.form.Button(null, "qx/icon/Oxygen/64/actions/dialog-ok.png"));
    },

    disposeLogo : function(parameters)
    {
    },

    disposeButton : function(parameters)
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

      if (listeners['onOpen']) {
        listener = listeners['onOpen'];
        this.addListener('openSearchDialogRelay', listener['call'], listener['context']);
      }
      this.fireDataEvent('openSearchDialogRelay', searchDialog);
    },

    disposeSearchDialog : function(parameters)
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

      if (listeners['onProceed']) {
        listener = listeners['onProceed'];
        proceedButton.addListener('click', listener['call'], listener['context']);
      }

      if (listeners['onOpen']) {
        listener = listeners['onOpen'];
        this.addListener('openBasketRelay', listener['call'], listener['context']);
      }
      this.fireDataEvent('openBasketRelay', this.basketContainer);
    },

    setBasketItem : function(index, item)
    {
      this.basketContainer.setBasketItem(index, item);
    },

    disposeBasket : function(parameters)
    {
      this.basketWindow.close();
      this.basketWindow.destroy();
    },

    generateForm : function(parameters)
    {

    },

    disposeForm : function(parameters)
    {

    },

    generateCustomInterface : function(parameters, listeners, overrides)
    {
      var customContainer = parameters['contents'];

      var title = parameters['title'];
      var left = parameters['left'];
      var top = parameters['top'];

      this.customWindow = new qx.ui.window.Window(title ? title : "Title");
      this.customWindow.setLayout(new qx.ui.layout.HBox(5));
      this.customWindow.setResizable(false, false, false, false);
			this.customWindow.setMovable(false);
			this.customWindow.setShowClose(false);
			this.customWindow.setShowMaximize(false);
			this.customWindow.setShowMinimize(false);

      this.customWindow.addListener("resize", this.getPositioningFunction(left, top), this.customWindow);

      this.customWindow.add(customContainer);

      this.customWindow.open();
      this.getRoot().add(this.customWindow);

      if (listeners['onOpen']) {
        listener = listeners['onOpen'];
        this.addListener('openCustomRelay', listener['call'], listener['context']);
      }
      this.fireDataEvent('openCustomRelay', customContainer);
    },

    disposeCustomInterface : function(parameters)
    {
      this.customWindow.close();
      this.customWindow.destroy();
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

      for (var i = 0; i < this.closingScreens.length; i++) {
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

      for (i = 0; i < this.openingScreens.length; i++) {
        screenParams = this.openingScreens[i];

        if (screenParams['listeners']['onTransitionCloseScreen']) {
          var autoCloseParams = screenParams['listeners']['onTransitionCloseScreen'];

          this.closeScreen(autoCloseParams['call'],
            autoCloseParams['context'],
            autoCloseParams['parameters']
          );
        }
      }

      qx.lang.Array.removeAll(this.openingScreens);

      this.contributionInstance.registerNextScreen(this);
    },

    openScreen : function(call, context, parameters, listeners, overrides)
    {
      if (!parameters) {
        parameters = {}
      }
      if (!listeners) {
        listeners = {}
      }
      if (!overrides) {
        overrides = {}
      }

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
      if (!parameters) {
        parameters = {}
      }
      
      this.closingScreens.push(
        {
          call: call,
          context: context,
          parameters: parameters
        });
    }
  }
});
