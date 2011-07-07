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
#asset(qx/icon/Oxygen/16/actions/go-up.png)
#asset(qx/icon/Oxygen/16/actions/go-down.png)
#asset(qx/icon/Oxygen/16/actions/go-next.png)
#asset(qx/icon/Oxygen/16/actions/go-previous.png)

#asset(qx/icon/Oxygen/22/actions/go-next.png)
#asset(qx/icon/Oxygen/22/actions/go-previous.png)

#asset(qx/icon/Oxygen/16/actions/go-home.png)
#asset(qx/icon/Oxygen/16/actions/edit-find.png)
#asset(qx/icon/Oxygen/16/actions/list-add.png)

#asset(qx/icon/Oxygen/64/actions/list-add.png)
#asset(qx/icon/Oxygen/64/actions/list-remove.png)

#asset(qx/icon/Oxygen/16/categories/development.png)

#asset(qx/icon/Oxygen/16/actions/mail-mark-unread.png)

#asset(qx/icon/Oxygen/16/apps/utilities-keyring.png)

#asset(qx/icon/Oxygen/16/actions/zoom-in.png)

#asset(qx/icon/Tango/32/places/user-trash.png)
#asset(qx/icon/Tango/32/places/user-trash-full.png)

#asset(qx/decoration/Modern/arrows/right.png)
#asset(qx/decoration/Modern/menu/radiobutton-invert.gif)

************************************************************************ */

qx.Class.define("gazebo.Application",
{
  extend : qx.application.Standalone,

	statics :
	{
    LEFT_SO_THAT_CENTERED : -1,
    TOP_SO_THAT_CENTERED : -1,

    // 2 pixel offset for a null decorator, so that the widget does not
    // "jump" when a decorator is applied.
    NULL_BUTTON_DECORATOR_OFFSET : 2,

    // Protocol used to connect to the server
    protocol : qx.core.Setting.get("gazebo.server.protocol"),
		// Hostname of the application's server
		hostname : qx.core.Setting.get("gazebo.server.hostname"),
		// HTTP port on the application's server, which might be null
		port : qx.core.Setting.get("gazebo.server.port"),
    // Common Gateway Interface that should be used
    cgi : qx.core.Setting.get("gazebo.server.interface"),

    // Time-out for common UI tasks
    timeout : 8000,
    delayedTimeout : 40000,

    // Global variable for keeping track of the UI's 'edited' state
    pendingChanges : false,

		// Generates the application's server URL
		getServerURL : function()
		{
			if (this.port) {
				return this.protocol + "://" + this.hostname + ":" + this.port + "/gazebo." + this.cgi;
			} else {
				return this.protocol + "://" + this.hostname + "/gazebo." + this.cgi;
			}
		},

    // Prepare a string for transmission via JSON. Some characters will
    // otherwise not make it to the server or will be rewritten into other
    // characters.
    marshallString : function(string)
    {
      // Marshalling seems to be alright since qooxdoo 1.4 and Ruby 1.9.
      return string;
    },

    // Rewrite date from database to human readable format.
    // Input:  2011-05-06T22:22:05+00:00
    // Output: 22:22, 6 May 2011
    rewriteDate : function(dateString)
    {
      var dateChunks = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(.{5})/);

      var year = dateChunks[1];
      var month = parseInt(dateChunks[2]);
      var day = parseInt(dateChunks[3]);
      var time = dateChunks[4];

      switch(month) {
      case 1:
        month = 'Jan';
        break;
      case 2:
        month = 'Feb';
        break;
      case 3:
        month = 'Mar';
        break;
      case 4:
        month = 'Apr';
        break;
      case 5:
        month = 'May';
        break;
      case 6:
        month = 'Jun';
        break;
      case 7:
        month = 'Jul';
        break;
      case 8:
        month = 'Aug';
        break;
      case 9:
        month = 'Sep';
        break;
      case 10:
        month = 'Oct';
        break;
      case 11:
        month = 'Nov';
        break;
      case 12:
        month = 'Dec';
        break;
      }

      return time + ', ' + day + ' ' + month + ' ' + year;
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

    getLayoutOptions : function(parameters)
    {
      var top = parameters['top'];
      var left = parameters['left'];
      var right = parameters['right'];
      var bottom = parameters['bottom'];
      var width = parameters['width'];
      var height = parameters['height'];

      return { top: top, bottom: bottom, left: left, right: right, width: width, height: height };
    },

    generateStatusDisplay : function(parameters, listeners, overrides)
    {
      var title = parameters['title'];
      var customElements = parameters['customElements'];
      var userIcon = parameters['userIcon'];
      var logoutIcon = parameters['logoutIcon'];
      var separator;

      var textColor = parameters['textColor'];
      var backgroundColor = parameters['backgroundColor'];

      var vertical = parameters['vertical'];

      this.statusWindow = new qx.ui.container.Composite().set({
        textColor: textColor,
        backgroundColor: backgroundColor
      });

      if (vertical) {
        separator = " - ";
        this.statusWindow.setLayout(new qx.ui.layout.VBox(10).set({
          alignX: 'left',
          alignY: 'middle'
        }));
      } else {
        separator = " | "
        this.statusWindow.setLayout(new qx.ui.layout.HBox(10).set({
          alignX: 'center',
          alignY: 'middle'
        }));
      }
      this.statusDisplayUsername = new qx.ui.basic.Atom().set({
        label: '-',
        rich: true,
        icon: userIcon
      });
      this.statusDisplayAuthenticationLink = new qx.ui.basic.Atom().set({
        label: 'Logout',
        rich: true,
        icon: logoutIcon
      });

      that = this;
      this.statusDisplayAuthenticationLink.addListener('click', function(mouseEvent) {
        that.contributionInstance.generateLogoutUI(that);
        that.suggestScreenTransition();
      }, this);

      var paddingTop, paddingRight, paddingBottom, paddingLeft;
      var marginTop, marginRight, marginBottom, marginLeft;

      // Placement of additional elements
      if (customElements) {
        var customContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));

        for (var i = 0; i < customElements.length; i++) {
          if (parameters['onMouseOver']) {
            customElements[i].addListener('mouseover', parameters['onMouseOver'], customElements[i]);
          }
          if (parameters['onMouseOut']) {
            customElements[i].addListener('mouseout', parameters['onMouseOut'], customElements[i]);
          }
          if (parameters['customElementPadding']) {
            paddingTop = parameters['customElementPadding'][0];
            paddingRight = parameters['customElementPadding'][1];
            paddingBottom = parameters['customElementPadding'][2];
            paddingLeft = parameters['customElementPadding'][3];

            customElements[i].setPadding(paddingTop, paddingRight, paddingBottom, paddingLeft);
          }
          if (parameters['customElementMargin']) {
            marginTop = parameters['customElementMargin'][0];
            marginRight = parameters['customElementMargin'][1];
            marginBottom = parameters['customElementMargin'][2];
            marginLeft = parameters['customElementMargin'][3];

            customElements[i].setMargin(marginTop, marginRight, marginBottom, marginLeft);
          }
          customContainer.add(customElements[i]);
        }
        this.statusWindow.add(customContainer);
        this.statusWindow.add(new qx.ui.basic.Label().set({
          value: separator,
          rich: true,
          paddingBottom: 3 // see also separator below
        }));
      }


      var metaContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      if (parameters['customElementPadding']) {
        this.statusDisplayUsername.setPadding(paddingTop, paddingRight, paddingBottom, paddingLeft);
        this.statusDisplayAuthenticationLink.setPadding(paddingTop, paddingRight, paddingBottom, paddingLeft);
      }
      if (parameters['customElementMargin']) {
        this.statusDisplayUsername.setMargin(marginTop, marginRight, marginBottom, marginLeft);
        this.statusDisplayAuthenticationLink.setMargin(marginTop, marginRight, marginBottom, marginLeft);
      }
      metaContainer.add(this.statusDisplayUsername);

      this.statusWindow.add(metaContainer);
      this.statusWindow.add(new qx.ui.basic.Label().set({
        value: separator,
        rich: true,
        paddingBottom: 3 // see also separator above
      }));
      this.statusWindow.add(this.statusDisplayAuthenticationLink);

      this.getRoot().add(this.statusWindow, this.getLayoutOptions(parameters));

      this.generateAuthenticationDispatcher(
        {},
        {
          'onAuthenticationSuccess': { call: this.updateStatusDisplay, context: this },
          'onAuthenticationFailure': { call: this.updateStatusDisplay, context: this }
        },
        {}
      );
    },

    updateStatusDisplay : function(dataEvent)
    {
      var status = dataEvent.getData();

      if (status && status['logged_in']) {
        this.statusDisplayUsername.setLabel(status['username']);
      } else {
        qx.lang.Array.removeAll(this.openingScreens);
        this.contributionInstance.generateLoginUI(this);
        this.suggestScreenTransition();
      }
    },

    disposeStatusDisplay : function(parameters)
    {
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
			rpc.setTimeout(gazebo.Application.timeout);
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
      var logo = parameters['logo'];

			this.connectionDialog = new gazebo.ui.ConnectionDialog(parameters, listeners, overrides);
			this.connectionDialog.addListener("connect", this.establishConnection, this);

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(0).set({
        alignX: 'center'
      }));
      var innerContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0).set({
        alignY: 'middle'
      }));

      if (logo)
        innerContainer.add(logo);

      this.connectionDialog.setMarginLeft(16);

      innerContainer.add(this.connectionDialog);
      container.add(innerContainer);
      this.connectionDialog = container;

      this.getRoot().add(this.connectionDialog, this.getLayoutOptions(parameters));
		},

    disposeConnectionDialog : function(parameters)
    {
      this.connectionDialog.destroy();
    },

    // Only for testing purposes, yet.
    generateLogo : function(parameters, listeners, overrides)
    {
      this.getRoot().add(new qx.ui.basic.Atom(null, "qx/icon/Oxygen/64/actions/dialog-ok.png"));
    },

    disposeLogo : function(parameters)
    {
    },

    disposeButton : function(parameters)
    {
    },

    generateSearchDialog : function(parameters, listeners, overrides)
    {
      this.searchDialog = new gazebo.ui.SuggestionTextField(parameters, listeners, overrides);

      var genuineSearchDialog = this.searchDialog;

      var title = parameters['title'];

      var composite = parameters['composite'];

      if (parameters['stripWhitespace']) {
        this.searchDialog.setStripWhitespace(parameters['stripWhitespace']);
      }

      if (composite) {
        composite.add(this.searchDialog);
      } else {
        var centeringContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(0).set({
          alignX: 'center',
          alignY: 'middle'
        }));
        var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));

        container.add(new qx.ui.basic.Label().set({
          value: title,
          rich: true,
          appearance: 'annotation'
        }));

        container.add(this.searchDialog);
        centeringContainer.add(container);
        this.searchDialog = centeringContainer;
        
        this.getRoot().add(this.searchDialog, this.getLayoutOptions(parameters));
      }

      if (listeners['onOpen']) {
        listener = listeners['onOpen'];
        this.addListener('openSearchDialogRelay', listener['call'], listener['context']);
      }
      this.fireDataEvent('openSearchDialogRelay', genuineSearchDialog);
    },

    disposeSearchDialog : function(parameters)
    {
      this.searchDialog.destroy();
    },

    generateBasket : function(parameters, listeners, overrides)
    {
      this.basketContainer = new gazebo.ui.BasketContainer(parameters, listeners, overrides);

      var title = parameters['title'];

      var composite = parameters['composite'];
      var proceedButton;

      if (composite) {
        var interfaceContainer = new qx.ui.container.Composite();
        interfaceContainer.setLayout(new qx.ui.layout.HBox(10));

        interfaceContainer.add(this.basketContainer);

        if (!parameters['hideProceedButton']) {
          interfaceContainer.add(new qx.ui.toolbar.Separator());

          proceedButton = new qx.ui.form.Button(null, "icon/64/actions/dialog-ok.png");
          interfaceContainer.add(proceedButton);
        }

        composite.add(interfaceContainer);
      } else {
        /*
        if (!parameters['hideProceedButton']) {
          this.basketWindow.add(new qx.ui.toolbar.Separator());

          proceedButton = new qx.ui.form.Button(null, "icon/64/actions/dialog-ok.png");
          this.basketWindow.add(proceedButton);
        }
        */
        composite = new qx.ui.container.Composite();

        composite.setLayout(new qx.ui.layout.HBox(10).set({
          alignX: 'center'
        }));

        composite.add(this.basketContainer);
        this.getRoot().add(composite, this.getLayoutOptions(parameters));
      }

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
      this.basketContainer.destroy();
    },

    generateForm : function(parameters)
    {

    },

    disposeForm : function(parameters)
    {

    },

    generateTabbedInterface : function(parameters, listeners, overrides)
    {
      var createNewPageOn = parameters['createNewPageOn'];
      var title = parameters['title'];

      // TODO Deal with title parameter.
      // var window = new qx.ui.window.Window(title ? title : "Title");
      var window = new qx.ui.container.Composite();

      // TODO Introduce uid to all generate* calls where relays are used.
      var uid = '' + window.toHashCode();

      window.setLayout(new qx.ui.layout.HBox(5).set({
        alignX: 'center'
      }));

      if (parameters['maxHeight']) {
        window.setMaxHeight(parameters['maxHeight']);
      }

      var tabInterface = new qx.ui.tabview.TabView();

      title = parameters['title0'];

      var page = new qx.ui.tabview.Page(title ? title : '');
      page.setLayout(new qx.ui.layout.VBox(20));

      var i = 0;
      while (parameters['generatorCall' + i]) {
        for (var j = 0; j < createNewPageOn.length; j++) {
          if (i == createNewPageOn[j]) {
            tabInterface.add(page);

            title = parameters['title' + i]
            page = new qx.ui.tabview.Page(title ? title : '');
            page.setLayout(new qx.ui.layout.VBox(20));
          }
        }

        var tabParameters = parameters['parameters' + i];
        var tabListeners = parameters['listeners' + i];
        var tabOverrides = parameters['overrides' + i];

        tabParameters['composite'] = page;

        parameters['generatorContext' + i].anonymousMethod = parameters['generatorCall' + i];
        parameters['generatorContext' + i].anonymousMethod(tabParameters, tabListeners, tabOverrides);

        i++;
      }
      tabInterface.add(page);

      window.add(tabInterface);

      this.getRoot().add(window, this.getLayoutOptions(parameters));

      var onTransitionCloseScreen = listeners['onTransitionCloseScreen'];
      if (onTransitionCloseScreen) {
        var onTransitionCloseScreenParameters = onTransitionCloseScreen['parameters'];
        onTransitionCloseScreenParameters['windowHandle'] = window;
      }
    },

    disposeTabbedInterface : function(parameters)
    {
      this.disposeCustomInterface(parameters);
    },

    generateCustomInterface : function(parameters, listeners, overrides)
    {
      var customContainer = parameters['contents'];

      var title = parameters['title'];

      var composite = parameters['composite'];

      if (composite) {
        composite.add(customContainer);
      } else {
        // TODO Deal with title parameter.
        //this.customWindow = new qx.ui.window.Window(title ? title : "Title");

        // TODO Introduce uid to all generate* calls where relays are used.
        var uid = '' + customContainer.toHashCode();

        // TODO Below: proof-of-concept of a desktop scroller
        //var desktop = new qx.ui.window.Desktop(new qx.ui.window.Manager());
        //desktop.add(this.customWindow);
        //var scroll = new qx.ui.container.Scroll();
        //scroll.setWidth(500);
        //scroll.setHeight(500);
        //scroll.add(desktop);
        //this.getRoot().add(scroll);
        composite = new qx.ui.container.Composite();

        composite.setLayout(new qx.ui.layout.HBox(10).set({
          alignX: 'center'
        }));

        composite.add(customContainer);
        this.getRoot().add(composite, this.getLayoutOptions(parameters));
      }

      if (listeners['onOpen']) {
        listener = listeners['onOpen'];
        this.addListener('openCustomRelay' + uid, listener['call'], listener['context']);
      }
      this.fireDataEvent('openCustomRelay' + uid, customContainer);

      // TODO Make this smart and universal for all generate* calls.
      var onTransitionCloseScreen = listeners['onTransitionCloseScreen'];
      if (onTransitionCloseScreen) {
        var onTransitionCloseScreenParameters = onTransitionCloseScreen['parameters'];
        onTransitionCloseScreenParameters['windowHandle'] = customContainer;
      }
    },

    disposeCustomInterface : function(parameters)
    {
      var windowHandle = this.customWindow;

      if (parameters && parameters['windowHandle']) {
        windowHandle = parameters['windowHandle'];
      }

      windowHandle.destroy();
    },

		establishConnection : function(dataEvent)
		{
      this.fireEvent("screen.close", null);
			this.contributionInstance.registerNextScreen(this);
      this.fireEvent("screen.open", null);
		},

    confirmationDialog : function()
    {
      return confirm('Discard unsaved changes?');
    },

    suggestScreenTransition : function()
    {
      // No intervention or post-poning yet.
      if (gazebo.Application.pendingChanges) {
        if (this.confirmationDialog())
          return;
      }
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
