/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************

#asset(gazebo/*)

************************************************************************ */

/**
 * A textfield with suggestions popping up as text is entered.
 */
qx.Class.define("gazebo.ui.SuggestionTextField",
{
  extend : qx.ui.container.Composite,

  /**
   * @param dataSource {String} Resource that is used for the pop-ups.
   */
  construct : function(parameters, listeners, overrides)
  {
    this.base(arguments);

    var searchButtonTitle = parameters['searchButtonTitle'];

    this.rpcRunning = null;
    this.openAll = false;

    this.setLayout(new qx.ui.layout.Grid(5, 0));
    
    this.textField = new qx.ui.form.TextField();

    // Bugfix for qooxdoo 1.0.1 and Chrome/Safari on OSX:
    this.textField.getContentElement().setAttribute("spellcheck", "false");

    this.textField.setMinWidth(400);
    this.textField.setLiveUpdate(true);
    this.textField.addListener("input", this.generateSuggestions, this);
    this.textField.addListener("keypress", function(keyEvent) {
        if (keyEvent.getKeyIdentifier() == 'Down' ||
            keyEvent.getKeyIdentifier() == 'PageDown') {
          if (this.suggestionTree.isSelectionEmpty()) {
            var rootNode = this.suggestionTree.getRoot();
            if (rootNode.hasChildren()) {
              // Uses a reference to the tree items, hence it is quick.
              var treeItems = rootNode.getChildren();
              this.suggestionTree.setSelection([ treeItems[0] ]);
            }
          }
          this.suggestionTree.focus();
          this.suggestionTree.activate();
        } else if (keyEvent.getKeyIdentifier() == 'Enter') {
          this.searchForItem(this.textField.getValue());
        }
    }, this);

    this.suggestionTree = new qx.ui.tree.Tree();
    this.suggestionTree.setHeight(0); // Pretend we do not exist.
    this.suggestionTree.setHideRoot(true);
    this.suggestionTree.hide();
    this.suggestionTree.setOpacity(0);
    this.suggestionTree.addListener("appear", function() {
        animation = new qx.fx.effect.core.Fade(this.suggestionTree.getContainerElement().getDomElement());
        animation.set({
          from : 0.0,
          to : 1.0,
          duration : 0.8
         });
        animation.start();
      }, this);
    // Fading out does not seem to work.
//    this.suggestionTree.addListener("disappear", function() {
//        animation = new qx.fx.effect.core.Fade(this.suggestionTree.getContainerElement().getDomElement());
//        animation.set({
//          from : 1.0,
//          to : 0.0,
//          duration : 0.8
//         });
//        animation.start();
//      }, this);

    this.treeRoot = new qx.ui.tree.TreeFolder("Root");
    this.treeRoot.setOpen(true);
    this.suggestionTree.setRoot(this.treeRoot);

    this.suggestionTree.addListener('dblclick', function() {
      var selection = this.suggestionTree.getSelection();

      if (selection &&
          selection.length == 1 &&
          !selection[0].getLabel().match(/\.\.\./)) {
            this.submitListener();
          }
    }, this);
    this.suggestionTree.addListener('keypress', function(keyEvent) {
      if (keyEvent.getKeyIdentifier() == 'Enter') {
        this.submitListener();
      }
    }, this);

    this.searchButton = new qx.ui.form.Button(searchButtonTitle ? searchButtonTitle : 'Search');

    this.searchButton.addListener('execute', function() {
      this.searchForItem(this.textField.getValue());
    }, this);

    this.add(this.textField, { row: 0, column: 0 });
    this.add(this.suggestionTree, { row: 1, column: 0 });
    this.add(this.searchButton, { row: 0, column: 1 });

    // Install custom listeners:
    var listener;
    if (listeners['onKeyPress']) {
      listener = listeners['onKeyPress'];
      this.textField.addListener("keypress", listener['call'], listener['context']);
    }
    if (listeners['onInput']) {
      listener = listeners['onInput'];
      this.addListener("inputRelay", listener['call'], listener['context']);
    }
    if (listeners['onSearch']) {
      listener = listeners['onSearch'];
      this.addListener("searchRelay", listener['call'], listener['context']);
    }

    // Install overrides:
    if (overrides['prepareFileSuggestion']) {
      this.prepareFileSuggestion = overrides['prepareFileSuggestion'];
    }
  },

  members :
  {
    submitListener : function() {
      var selection = this.suggestionTree.getSelection();

      if (selection && selection.length == 1) {
        this.searchForItem(selection[0].getLabel());
      }
    },

    focus : function()
    {
      this.textField.focus();
    },

    setStripWhitespace : function(bool)
    {
      this.stripWhitespace = bool;
    },

    getStripWhitespace : function()
    {
      return this.stripWhitespace;
    },
    
    prepareFileSuggestion : function(parameters)
    {
      var file;
      var abstraction = parameters[0];
      
      // Simple case: no additional information except the suggestion itself.
      if (parameters.length < 2) {
        file = new qx.ui.tree.TreeFile(abstraction);
        file.addState("small");

        return file;
      }

      file = new qx.ui.tree.TreeFile();

      file.addState("small"); // Small icons.

      file.addSpacer();
      file.addLabel(abstraction);
      file.addWidget(new qx.ui.core.Spacer(), {flex: 1});
      for (j = 2; j < parameters.length; j++) {
        var customAnnotation = parameters[j];
        if (j > 2) {
          file.addWidget(new qx.ui.basic.Label(
            ",&nbsp;"
          ).set({ appearance: "annotation", rich: true}));
        }
        file.addWidget(
          new qx.ui.basic.Label(
            customAnnotation
          ).set({ appearance: "annotation", rich: true }));
      }

      return file;
    },

    /**
     * @param dataEvent {qx.event.type.Data} Result of the database query.
     */
    generateSuggestions : function(dataEvent)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(2000); // 2sec time-out, arbitrarily chosen.
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      var textValue = dataEvent.getData();

      if (!textValue || textValue.length == 0) {
        this.suggestionTree.hide();
        this.suggestionTree.setOpacity(0);
        this.treeRoot.removeAll();
        return;
      }

      // Remove whitespace?
      textValue = this.stripWhitespace?textValue.replace(/^\s+|\s+$/g, ""):textValue;

      var options;
      if (this.openAll) {
        options = { count : true }; // Count is not needed here, but simplifies code below.
      } else {
        options = { count : true, limit : 14 }; // Some Firefox/Windows add a scrollbar for >13?
      }

      var that = this;
      this.rpcRunning = rpc.callAsync(
        function(result, ex, id)
        {
          if (that.rpcRunning && that.rpcRunning.getSequenceNumber() == id) {
            that.debug("This: " + this + " That: " + that + " RPC: " + that.rpcRunning +
               " Seq: " + that.rpcRunning.getSequenceNumber() + " Id: " + id);
            that.openAll = false; // Always default back to a short list of suggestions.
            that.treeRoot.removeAll();

            var folder, file;

            if (!result || result.length == 0) {
              file = new qx.ui.tree.TreeFile();
              file.addWidget(
                new qx.ui.basic.Label(
                  "(no matches)"
                ).set({ appearance: "annotation", rich: true }));
              that.treeRoot.add(file);

              // Event relaying on failure:
              that.fireDataEvent("inputRelay", null, textValue);
              return;
            }

            count = result[0];
            result = result[1];

            for (i = 0; i < result.length; i++) {
              var abstraction = result[i][0];
              var matches = result[i][1];
              if (result[i][1] > 1) {
                folder = new qx.ui.tree.TreeFolder();
                folder.addState("small"); // Small icons.
                folder.setOpenSymbolMode("always");
                folder.addListener("changeOpen", that.openFolder, that);

                folder.addSpacer();
                folder.addOpenButton();
                folder.addLabel(abstraction);
                folder.addWidget(new qx.ui.core.Spacer(), {flex: 1});
                folder.addWidget(
                  new qx.ui.basic.Label(
                    "(" + matches + " matches)"
                  ).set({ appearance: "annotation", rich: true }));

                that.treeRoot.add(folder);
              } else  {
                file = that.prepareFileSuggestion(result[i]);

                that.treeRoot.add(file);
              }
            }

            moreMatches = count[0] - result.length;

            if (moreMatches > 0) {
              file = new qx.ui.tree.TreeFile(" ");
              file.setIcon(null);
              file.addWidget(
                new qx.ui.basic.Label(
                  "(" + moreMatches + " more matches - click to view)"
                ).set({ appearance: "annotation", rich: true }));
              file.addListener("changeOpen", function(dataEvent) {
                that.openAll = true;
                var newDataEvent = new qx.event.type.Data().init(that.textField.getValue());
                that.generateSuggestions(newDataEvent);
              }, that);
              file.setOpenSymbolMode("always");
              that.treeRoot.add(file);
            }

            that.suggestionTree.setMinHeight(303);
            that.suggestionTree.show();
            
            // Event relaying on success:
            var treeItem = that.searchForTreeItem(textValue, that.suggestionTree.getRoot());

            that.fireDataEvent("inputRelay", treeItem, textValue);
          }
        },
        "query",
        options,
        "fb2010_03",
        [ "*" ],
        [ "x_searchables_" + ( textValue.length - 1 ) ],
        "searchable ilike ?",
        [ textValue + "%" ]
      );
    },

    openFolder : function(folderEvent)
    {
      var folder;
      if (folderEvent.getData()) {
        // Folder opened.
        if (this.suggestionTree.isSelectionEmpty()) {
          // No folder selected. Weird. Why did we get an event then?
          return;
        }

        var selectedItems = this.suggestionTree.getSelection();
        folder = selectedItems[0];

        if (folder.hasChildren()) {
          // We already populated the folder.
          return;
        }
      
        var rpc = new qx.io.remote.Rpc();
        rpc.setTimeout(5000); // 5sec time-out, arbitrarily chosen.
        rpc.setUrl(gazebo.Application.getServerURL());
        rpc.setServiceName("gazebo.cgi");

        var textValue = folder.getLabel();
      
        if (!textValue) {
          return;
        }

        // Workaround: For some reason, '+' does not make it to the server.
        textValue = textValue.replace("@", "@@");
        textValue = textValue.replace("+", "@P");
        this.debug("Searching for: " + textValue);

        var that = this;
        this.rpcRunning = rpc.callAsync(
          function(result, ex, id)
          {
            if (that.rpcRunning && that.rpcRunning.getSequenceNumber() == id) {

              if (!result) {
                // No result.
                return;
              }

              var childFolder, childFile;
              for (i = 0; i < result.length; i++) {
                if (result[i][1].match(/\.\.\./)) {
                  childFolder = new qx.ui.tree.TreeFolder(result[i][1]);
                  childFolder.addState("small"); // Small icons.
                  childFolder.setOpenSymbolMode("always");
                  childFolder.addListener("changeOpen", that.openFolder, that);
                  folder.add(childFolder);
                } else  {
                  /*
                  childFile = new qx.ui.tree.TreeFile(result[i][1]);
                  childFile.addState("small");
                  folder.add(childFile);
                  */
                  var childParameters = result[i];
                  childParameters.shift();
                  childFile = that.prepareFileSuggestion(childParameters);
                  folder.add(childFile);
                }
              }
              that.suggestionTree.show();
            }
          },
          "query",
          {},
          "fb2010_03",
          [ "*" ],
          [ "x_fast_transitions" ],
          "abstraction == ? ORDER BY concretisation ASC",
          [ textValue ]
        );
      }
    },

    searchForItem : function(label)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(2000); // 2sec time-out, arbitrarily chosen.
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      if (!label || label.length == 0) {
        label = this.textField.getValue();
      }

      // Remove whitespace?
      label = this.stripWhitespace?label.replace(/^\s+|\s+$/g, ""):label;

      this.debug('Searching for <' + label + '>');
      
      var that = this;
      this.rpcRunning = rpc.callAsync(
        function(result, ex, id)
        {
          that.debug('Result: ' + result);
          if (that.rpcRunning && that.rpcRunning.getSequenceNumber() == id) {

            // No result returned.
            if (!result || result.length == 0) {
              that.fireDataEvent("searchRelay", null, label);
              return;
            }

            that.debug('searchForItem: ' + result);
            var treeItem = new qx.ui.tree.TreeFile();
            treeItem.model_workaround = result[0];
            that.fireDataEvent("searchRelay", treeItem, result[0][0]);
          }
        },
        "query",
        { limit: 1 },
        "fb2010_03",
        [ "*" ],
        [ "x_searchables_" + ( label.length - 1 ) ],
        "searchable like ?", // TODO: Figure out why = is not working.
        [ label ]
      );
    },

    searchForTreeItem : function(label, item)
    {
      if (!item) { return null; }

      // Found it! Bubble up...
      if (item.getLabel() == label) {
        this.suggestionTree.setSelection([item]);

        return item;
      }
      
      if (item.hasChildren()) {
        var childItems = item.getChildren();
        
        for (var i = 0; i < childItems.length; i++) {
          var result = this.searchForTreeItem(label, childItems[i]);
          
          if (result) { return result; } // Bubble up found item.
        }
      }
      
      return null; // Not Found.
    }
  }
});