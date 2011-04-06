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
    var searchButtonIcon = parameters['searchButtonIcon'];
    var minWidth = parameters['textFieldMinimalWidth'] ? parameters['textFieldMinimalWidth'] : 300;

    this.disableSuggestions = parameters['disableSuggestions'];
    this.database = parameters['database'];

    this.rpcRunning = null;
    this.openAll = false;

    var layout = new qx.ui.layout.Grid(5,0);
    this.setLayout(layout);
    this.layout = layout;

    if (parameters['keepHistory']) {
      this.makeHistoryTree();

      // Set fixed height or widget will jump when decorator is added/removed.
      this.showHistoryAtom = new qx.ui.basic.Atom('Show History', 'qx/decoration/Modern/arrows/right.png').set({
        appearance: 'annotation',
        height: 20
      });

      this.showHistoryAtom.addListener('mouseover', function(mouseEvent) {
        this.setDecorator('button-hovered');
      }, this.showHistoryAtom);

      this.showHistoryAtom.addListener('mouseout', function(mouseEvent) {
        this.setDecorator(null);
      }, this.showHistoryAtom);

      this.showHistoryAtom.addListener('click', function(mouseEvent) {
        this.showHistoryAtom.setDecorator(null);
        this.remove(this.showHistoryAtom);

        this.add(this.historyTree, { row: 1, column: 0 });
        this.historyTree.focus();
      }, this);

      this.add(this.showHistoryAtom, { row: 1, column: 0 });
    }

    this.textField = new qx.ui.form.TextField();

    // Bugfix for qooxdoo 1.0.1 and Chrome/Safari on OSX:
    this.textField.getContentElement().setAttribute("spellcheck", "false");

    this.textField.setMinWidth(minWidth);
    this.textField.setLiveUpdate(true);
    this.textField.addListener("input", this.generateSuggestions, this);
    this.textField.addListener("keypress", function(keyEvent) {
        if (keyEvent.getKeyIdentifier() == 'Down' ||
            keyEvent.getKeyIdentifier() == 'PageDown') {
          if (!this.suggestionTree) { return; }

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
          if (this.history && this.indexOf(this.showHistoryAtom) >= 0) {
            this.remove(this.showHistoryAtom);
          }
          this.suggestionTree.show();
        } else if (keyEvent.getKeyIdentifier() == 'Escape') {
          this.suggestionTree.hide();
          if (this.history) {
            this.add(this.showHistoryAtom, { row: 1, column: 0 });
          }
        } else if (keyEvent.getKeyIdentifier() == 'Enter') {
          var input = this.textField.getValue();
          this.searchForItem(input);
          if (this.history) {
            this.addHistoryItem(input);
          }
        }
    }, this);

    this.suggestionTree = null;

    if (searchButtonTitle == null) { searchButtonTitle = 'Search'; }
    this.searchButton = new qx.ui.form.Button(searchButtonTitle.length == 0? null : searchButtonTitle, searchButtonIcon);

    this.searchButton.addListener('execute', function() {
      var input = this.textField.getValue();
      this.searchForItem(input);
      if (this.history) {
        this.addHistoryItem(input);
      }
    }, this);

    layout.setRowAlign(0, "center", "middle");
    this.add(this.textField, { row: 0, column: 0 });

    var helpAtom = new qx.ui.basic.Atom(null, "qx/icon/Oxygen/16/actions/help-about.png").set({
      width: 20,
      height: 20,
      paddingLeft: gazebo.Application.NULL_BUTTON_DECORATOR_OFFSET
    });

    helpAtom.addListener('mouseover', function(mouseEvent) {
      this.setDecorator('button-hovered');
      this.setPaddingLeft(0);
    }, helpAtom);
    helpAtom.addListener('mouseout', function(mouseEvent) {
      this.setDecorator(null);
      this.setPaddingLeft(gazebo.Application.NULL_BUTTON_DECORATOR_OFFSET);
    }, helpAtom);

    this.add(helpAtom, { row: 0, column: 1 });
    this.add(this.searchButton, { row: 0, column: 3 });

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
    addHistoryItem : function(inputText)
    {
      var currentHistory = this.history.getChildren();

      // If an item exists in the history already, do not record it again.
      for (var i = 0; i < currentHistory.length; i++) {
        if (currentHistory[i].model_workaround == inputText) {
          return;
        }
      }

      var historyItem = new qx.ui.tree.TreeFile(inputText);
      // Leaves a gap at the beginning of the layout. Looks unpleasant.
      //historyItem.addWidget(new qx.ui.basic.Atom(null, 'qx/decoration/Modern/menu/radiobutton-invert.gif'));
      //historyItem.addWidget(
      //  new qx.ui.basic.Label(
      //    inputText
      //  ).set({ appearance: "annotation", rich: true })
      //);

      historyItem.model_workaround = inputText;

      this.history.addAtBegin(historyItem);
    },

    getHistory : function()
    {
      var history = this.history.getChildren();
      var historyArray = new Array();

      for (var i = 0; i < history.length; i++) {
        historyArray.push(history[i].model_workaround);
      }

      return historyArray;
    },

    // A history tree is only created once and then filled with elements
    // as we go along..
    makeHistoryTree : function()
    {
      this.historyTree = new qx.ui.tree.Tree();
      this.historyTree.setHideRoot(true);

      this.history = new qx.ui.tree.TreeFolder("Root");
      this.history.setOpen(true);
      this.historyTree.setRoot(this.history);

      this.historyTree.addListener('dblclick', function() {
        var selection = this.historyTree.getSelection();

        if (selection && selection.length == 1) {
          this.searchForItem(selection[0].model_workaround);
        }

        this.remove(this.historyTree);
      }, this);
      this.historyTree.addListener('keypress', function(keyEvent) {
        if (keyEvent.getKeyIdentifier() == 'Enter') {
          var selection = this.historyTree.getSelection();

          if (selection && selection.length == 1) {
            this.searchForItem(selection[0].model_workaround);
          }

          this.remove(this.historyTree);
        }
      }, this);
      this.historyTree.addListener('focusout', function(focusEvent) {
        if (this.indexOf(this.historyTree) >= 0) {
          this.remove(this.historyTree);
        }
      }, this);
    },

    makeSuggestionTree : function() {
      this.suggestionTreePopup = new qx.ui.popup.Popup(new qx.ui.layout.HBox(10));
      this.suggestionTree = new qx.ui.tree.Tree();
      this.suggestionTree.setHeight(0); // Pretend we do not exist.
      this.suggestionTree.setHideRoot(true);
      this.suggestionTree.hide();

      // TODO Hack to show proof-of-principle.
      var that = this;
      this.suggestionTreePopup.getRoot = function() {
        return that.suggestionTree.getRoot();
      };
      this.suggestionTreePopup.isSelectionEmpty = function() {
        return that.suggestionTree.isSelectionEmpty();
      };
      this.suggestionTreePopup.getSelection = function() {
        return that.suggestionTree.getSelection();
      };
      this.suggestionTreePopup.setSelection = function(a) {
        return that.suggestionTree.setSelection(a);
      };

      if (this.history && this.indexOf(this.showHistoryAtom) >= 0) {
        this.add(this.showHistoryAtom, { row: 1, column: 0 });
      }

      // Fading in works in principle, but shows some nasty flickering
      // when reappearing after being hidden. Disable for now to make
      // the interface seem snappier.
      // this.suggestionTree.setOpacity(0);
      //this.suggestionTree.addListener("appear", function() {
      //    animation = new qx.fx.effect.core.Fade(this.suggestionTree.getContainerElement().getDomElement());
      //    animation.set({
      //      from : 0.0,
      //      to : 1.0,
      //      duration : 0.8
      //     });
      //    animation.start();
      //}, this);

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

      this.suggestionTreePopup.placeToWidget(this.textField, true);
      this.suggestionTreePopup.add(this.suggestionTree);
      //this.add(this.suggestionTreePopup, { row: 2, column: 0 });
      this.suggestionTreePopup.show();
    },

    clear : function() {
      this.textField.setValue("");
      this.generateSuggestions(new qx.event.type.Data().init(""));

      if (this.suggestionTree) {
        this.suggestionTree.destroy();
        this.suggestionTree = null;
      }

      this.focus();
    },

    submitListener : function() {
      var selection = this.suggestionTree.getSelection();

      if (selection && selection.length == 1) {
        var input = selection[0].getLabel();
        this.searchForItem(input);
        if (this.history) {
          this.addHistoryItem(input);
        }
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
      if (this.disableSuggestions) {
        return;
      }

      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(gazebo.Application.timeout);
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      var textValue = dataEvent.getData();

      if (!textValue || textValue.length == 0) {
        // Was used for fading out suggestionTree, but did not look nice.
        //this.suggestionTree.hide();
        //this.suggestionTree.setOpacity(0);
        if (this.suggestionTree) {
          this.suggestionTree.destroy();
          this.suggestionTree = null;
        }

        if (this.history) {
          this.add(this.showHistoryAtom, { row: 1, column: 0 });
        }

        //this.treeRoot.removeAll();
        return;
      }
      
      if (!this.suggestionTree) {
        this.makeSuggestionTree();
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

            if (!that.suggestionTree) {
              that.makeSuggestionTree();
            }

            if (that.history && that.indexOf(that.showHistoryAtom) >= 0) {
              that.remove(that.showHistoryAtom);
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
        this.database,
        [ "*" ],
        [ "x_searchables_" + ( textValue.length - 1 ) ],
        "searchable ilike ?",
        [ gazebo.Application.marshallString(textValue) + "%" ]
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
        rpc.setTimeout(gazebo.Application.delayedTimeout);
        rpc.setUrl(gazebo.Application.getServerURL());
        rpc.setServiceName("gazebo.cgi");

        var textValue = folder.getLabel();
      
        if (!textValue) {
          return;
        }

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
              for (var i = 0; i < result.length; i++) {
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

              if (that.history) {
                that.add(that.showHistoryAtom, { row: 1, column: 0 });
              }

              that.suggestionTree.show();
            }
          },
          "query",
          {},
          this.database,
          [ "*" ],
          [ "x_fast_transitions" ],
          "abstraction == ? ORDER BY concretisation ASC",
          [ gazebo.Application.marshallString(textValue) ]
        );
      }
    },

    searchForItem : function(label, annotation, aides, dependency_column)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(gazebo.Application.timeout);
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      if (!label || label.length == 0) {
        label = this.textField.getValue();
      }

      // Remove whitespace?
      label = this.stripWhitespace ? label.replace(/^\s+|\s+$/g, "") : label;
      
      var that = this;
      this.rpcRunning = rpc.callAsync(
        function(result, ex, id)
        {
          that.debug('Result: ' + result);
          if (that.rpcRunning) { // && that.rpcRunning.getSequenceNumber() == id) {

            // No result returned.
            if (!result ||
                result.length == 0 ||
                (dependency_column != null && result[0][dependency_column] == '')
               ) {
              if (aides) {
                var columns = [];
                var tables = [];
                var queries = [];
                var arguments = [];
                var previous_result = result ? result[0] : null;

                that.debug("LABEL: " + label);
                for (var i = 0; i < aides.length; i++) {
                  columns.push([ '*' ]);
                  tables.push([ 'x_searchables_' + (aides[i].length - 1 ) ]);
                  queries.push('searchable like ?');
                  arguments.push(aides[i]);
                  that.debug("AIDE: " + aides[i]);
                }

                that.rpcRunning = rpc.callAsync(
                  function(result, ex, id)
                  {
                    that.debug('Re-query (' + label + ') Result: ' + result);

                    if (that.rpcRunning) { // TODO ...check id....
                      if (result) {
                        var treeItem = new qx.ui.tree.TreeFile();
                        // Setting the model in Qooxdoo 1.0 does not work. Bug.
                        treeItem.model_workaround = result;
                        treeItem.annotation = annotation;
                        that.fireDataEvent("searchRelay", [treeItem, label, true], previous_result);
                      } else {
                        that.fireDataEvent("searchRelay", [null, label, true], previous_result);
                      }
                    }
                  },
                  "query_union",
                  {},
                  that.database,
                  columns,
                  tables,
                  queries,
                  arguments
                );

                return;
              }

              // No aides given, so report failure.
              that.fireDataEvent("searchRelay", [null, label, false]);
              return;
            }

            that.debug('searchForItem: ' + result);
            var treeItem = new qx.ui.tree.TreeFile();
            // Setting the model in Qooxdoo 1.0 does not work. Bug.
            treeItem.model_workaround = result;
            treeItem.annotation = annotation;
            that.fireDataEvent("searchRelay", [treeItem, result[0][0], false]);
          }
        },
        "query",
        { limit: 1 },
        this.database,
        [ "*" ],
        [ "x_searchables_" + ( label.length - 1 ) ],
        "searchable like ?", // TODO: Figure out why = is not working.
                             // 'like' may cause performance problems?'
        [ gazebo.Application.marshallString(label) ]
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