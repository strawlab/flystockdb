/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/**
 * A class for editing the metadata of genotypes.
 */
qx.Class.define("gazebo.fly.GenotypeMetadata",
{
  extend : qx.ui.container.Composite,

  statics :
  {

  },

  construct : function(parameters, listeners, overrides)
  {
    this.base(arguments);

    var inquirer = parameters['inquirer'];

    this.search = parameters['search'];
    this.genotype = parameters['genotype'];

    this.setLayout(new qx.ui.layout.HBox(10));

    this.setMinWidth(800);

    this.container = new qx.ui.container.Composite();
    this.container.setLayout(new qx.ui.layout.VBox(10));
    
    var idContainer = new qx.ui.container.Composite();
    idContainer.setLayout(new qx.ui.layout.HBox(10));

    var idContainer1 = new qx.ui.container.Composite();
    idContainer1.setLayout(new qx.ui.layout.VBox(10));

    var idContainer2 = new qx.ui.container.Composite();
    idContainer2.setLayout(new qx.ui.layout.VBox(10));

    var idContainer3 = new qx.ui.container.Composite();
    idContainer3.setLayout(new qx.ui.layout.VBox(10));

    var idContainer4 = new qx.ui.container.Composite();
    idContainer4.setLayout(new qx.ui.layout.VBox(10));

    var idContainer5 = new qx.ui.container.Composite();
    idContainer5.setLayout(new qx.ui.layout.VBox(10));

    var idContainer6 = new qx.ui.container.Composite();
    idContainer6.setLayout(new qx.ui.layout.VBox(10));

    var idContainer7 = new qx.ui.container.Composite();
    idContainer7.setLayout(new qx.ui.layout.VBox(10));

    var idContainer8 = new qx.ui.container.Composite();
    idContainer8.setLayout(new qx.ui.layout.VBox(10));

    idContainer1.add(new qx.ui.basic.Label().set({
      value: 'Internal Stock-ID',
      rich: true,
      appearance: 'annotation'
    }));
    this.internalStockID = new qx.ui.form.TextField().set({
      readOnly: true,
      width: 110
    });
    idContainer1.add(this.internalStockID);

    idContainer2.add(new qx.ui.basic.Label().set({
      value: 'External Stock-ID',
      rich: true,
      appearance: 'annotation'
    }));
    this.xrefTextField = new qx.ui.form.TextField().set({
      width: 110
    });
    idContainer2.add(this.xrefTextField);

    idContainer3.add(new qx.ui.basic.Label().set({
      value: 'Source / Donor',
      rich: true,
      appearance: 'annotation'
    }));
    this.donorTextField = new qx.ui.form.TextField().set({
      width: 180
    });
    idContainer3.add(this.donorTextField);

    var separator1 = new qx.ui.menu.Separator();
    separator1.setDecorator('separator-horizontal');
    separator1.setWidth(3);
    separator1.setHeight(45);
    idContainer4.add(separator1);

    idContainer5.add(new qx.ui.basic.Label().set({
      value: 'Wildtype Name',
      rich: true,
      appearance: 'annotation'
    }));
    this.wildtypeTextField = new qx.ui.form.TextField().set({
      width: 130
    });
    idContainer5.add(this.wildtypeTextField);

    var separator2 = new qx.ui.menu.Separator();
    separator2.setDecorator('separator-horizontal');
    separator2.setWidth(3);
    separator2.setHeight(45);
    idContainer6.add(separator2);

    idContainer7.add(new qx.ui.basic.Label().set({
      value: 'Stock Entered By',
      rich: true,
      appearance: 'annotation'
    }));

    if (this.search) {
      this.usernameSelectBox = new qx.ui.form.SelectBox().set({
        width: 130
      })
      idContainer7.add(this.usernameSelectBox);
    } else {
      this.usernameTextField = new qx.ui.form.TextField().set({
        readOnly: true,
        width: 130
      });
      idContainer7.add(this.usernameTextField);
    }

    idContainer8.add(new qx.ui.basic.Label().set({
      value: 'Contact / Stock Owner',
      rich: true,
      appearance: 'annotation'
    }));
    this.contactSelectBox = new qx.ui.form.SelectBox().set({
      width: 130
    })
    idContainer8.add(this.contactSelectBox);

    idContainer.add(idContainer1);
    idContainer.add(idContainer2);
    idContainer.add(idContainer3);
    idContainer.add(idContainer4);
    idContainer.add(idContainer5);
    idContainer.add(idContainer6);
    idContainer.add(idContainer7);
    idContainer.add(idContainer8);

    this.container.add(idContainer);

    var textContainer = new qx.ui.container.Composite();
    textContainer.setLayout(new qx.ui.layout.HBox(10));

    var textContainer1 = new qx.ui.container.Composite();
    textContainer1.setLayout(new qx.ui.layout.VBox(10));

    var textContainer2 = new qx.ui.container.Composite();
    textContainer2.setLayout(new qx.ui.layout.VBox(10));

    textContainer1.add(new qx.ui.basic.Label().set({
      value: 'Vial Label / Bottle Label',
      rich: true,
      appearance: 'annotation'
    }));

    if (this.search) {
      this.vialTextX = new qx.ui.form.TextField().set({
        width: 230
      });
      textContainer1.add(this.vialTextX);
    } else {
      this.vialTextX = new qx.ui.form.TextArea().set({
        maxLength: 65535,
        height: 150,
        width: 230
      });
      textContainer1.add(this.vialTextX);
    }

    textContainer2.add(new qx.ui.basic.Label().set({
      value: 'Descriptions, Annotations and Notes',
      rich: true,
      appearance: 'annotation'
    }));

    if (this.search) {
      this.descriptionTextX = new qx.ui.form.TextField().set({
        width: 640
      });
      textContainer2.add(this.descriptionTextX);
    } else {
      this.descriptionTextX = new qx.ui.form.TextArea().set({
        maxLength: 65535,
        height: 150,
        width: 640
      });
      textContainer2.add(this.descriptionTextX);
    }

    textContainer.add(textContainer1);
    textContainer.add(textContainer2);

    this.container.add(textContainer);

    groupContainer = new qx.ui.container.Composite();
    groupContainer.setLayout(new qx.ui.layout.VBox(10));

    groupContainer1 = new qx.ui.container.Composite();
    groupContainer1.setLayout(new qx.ui.layout.VBox(10));

    groupContainer2 = new qx.ui.container.Composite();
    groupContainer2.setLayout(new qx.ui.layout.VBox(10));

    groupContainer3 = new qx.ui.container.Composite();
    groupContainer3.setLayout(new qx.ui.layout.VBox(10));

    var permissionGroups = new qx.ui.tree.Tree().set({
      hideRoot: true,
      width: 350,
      height: 150
    });

    this.permissionGroupsRoot = new qx.ui.tree.TreeFolder().set({
      open: true
    });
    permissionGroups.setRoot(this.permissionGroupsRoot);

    permissionGroups.setSelectionMode("multi");

    groupContainer.add(new qx.ui.basic.Label().set({
      value: 'Assigned Groups',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer.add(permissionGroups);

    this.updateGroups();

    this.container.add(groupContainer);

    this.add(this.container);

    var mainSeparator = new qx.ui.menu.Separator();
    mainSeparator.setDecorator('separator-horizontal');
    mainSeparator.setWidth(3);
    this.add(mainSeparator);

    var submitButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/dialog-ok.png');
    this.add(submitButton);

    if (this.search) {
      this.updateContacts();
    } else {
      inquirer.generateAuthenticationDispatcher(
        {},
        {
          'onAuthenticationSuccess': { call: this.updateUsername, context: this },
          'onAuthenticationFailure': { call: this.updateUsername, context: this }
        },
        {}
      );
    }

    if (listeners['onOpen']) {
      listener = listeners['onOpen'];
      this.addListener('openGenotypeMetadataRelay', listener['call'], listener['context']);
    }
    this.fireDataEvent('openGenotypeMetadataRelay', this);

    if (this.search && listeners['onProceed']) {
      listener = listeners['onProceed'];
      this.addListener('onProceedRelay', listener['call'], listener['context']);

      submitButton.addListener('execute',
        function() {
          this.fireDataEvent('onProceedRelay', this);
        },
        this
      );
    }

    if (!this.search) {
      if (listeners['onProceed']) {
        listener = listeners['onProceed'];
        this.addListener('onProceedRelay', listener['call'], listener['context']);
      }

      submitButton.addListener('execute',
        function() {
          this.saveStock();
        },
        this
      );
    }
  },

  members:
  {
    // TODO Appears also in Administration.js.. should provide a general implementation.
    selectionPosition : function(selectBox)
    {
      var selectables = selectBox.getSelectables();

      for (var i = 0; i < selectables.length; i++) {
        if (selectBox.isSelected(selectables[i])) {
          return i;
        }
      }

      return -1;
    },

    saveStock : function()
    {
      var rpc = new qx.io.remote.Rpc();
			rpc.setTimeout(gazebo.Application.timeout);
			rpc.setUrl(gazebo.Application.getServerURL());
			rpc.setServiceName("gazebo.cgi");

      var that = this;

      var xref = this.xrefTextField.getValue();
      var label = this.vialTextX.getValue();
      var description = this.descriptionTextX.getValue();
      var donor = this.donorTextField.getValue();
      var contact = this.contactSelectBox.getSelectables()[this.selectionPosition(this.contactSelectBox)].getLabel();
      var wildtype = this.wildtypeTextField.getValue();

      this.rpcRunning = rpc.callAsync(
        function(result, ex, id)
        {
          // TODO Check result.
          that.fireDataEvent('onProceedRelay', that);
        },
        "update_data",
        {},
        gazebo.fly.Contribution.FLYBASE_DB,
        "x_stocks",
        parseInt(this.internalStockID.getValue()),
        [ "xref", "genotype", "label", "description", "donor", "contact", "wildtype" ],
        [
          xref,
          gazebo.Application.marshallString(this.genotype),
          label,
          description,
          donor,
          contact,
          wildtype
        ]
      );
    },

    updateInternalStockID : function(stockID)
    {
      this.internalStockID.setValue(stockID);
    },

    updateUsername : function(dataEvent)
    {
      var status = dataEvent.getData();

      if (status && status['logged_in']) {
        this.usernameTextField.setValue(status['username']);
        this.updateContacts();
      }
    },

    // Gets called twice, which is kind of right because the userlist
    // is requested twice from the server. However, I have no clue why
    // it is called twice, because updateContacts above seems to be only
    // called once.
    updateContacts : function()
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(gazebo.Application.timeout);
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      var that = this;

      rpc.callAsync(
        function(result, ex, id)
        {
          if (!result || result.length == 0) {
            // TODO Retry and eventually error handling..
            return;
          }

          that.contactSelectBox.removeAll();

          // Add default selection when searching, which searches everyone.
          if (that.search) {
            var defaultUser = new qx.ui.form.ListItem().set({
              label: '<i>everyone</i>',
              rich: true
            });
            that.contactSelectBox.add(defaultUser);
            defaultUser = new qx.ui.form.ListItem().set({
              label: '<i>everyone</i>',
              rich: true
            });
            that.usernameSelectBox.add(defaultUser);
          }

          var thisUser = null;

          for (var i = 0; i < result.length; i++) {
            var user = new qx.ui.form.ListItem(result[i][0]);

            if (!that.search && result[i][0] == that.usernameTextField.getValue()) {
              thisUser = user;
            }

            that.contactSelectBox.add(user);

            if (that.search) {
              user = new qx.ui.form.ListItem(result[i][0]); // Cannot re-use ListItem.
              that.usernameSelectBox.add(user);
            }
          }

          if (thisUser) {
            that.contactSelectBox.setSelection([ thisUser ]);
          }
        },
        'get_userlist',
        {},
        "true",
        []
      );
    },

    updateGroups : function()
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(gazebo.Application.timeout);
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      var that = this;
      
      rpc.callAsync(
        function(result, ex, id)
        {
          if (!result || result.length == 0) {
            // TODO Retry and eventually error handling..
            return;
          }

          for (var i = 0; i < result.length; i++) {
            var group = new qx.ui.tree.TreeFile();

            groupCheckbox = new qx.ui.form.CheckBox();
            groupCheckbox.setFocusable(false);

            if (result[i][0] == 'Public') {
              groupCheckbox.setValue(true);
            }

            group.addWidget(groupCheckbox);
            group.addWidget(new qx.ui.core.Spacer(5));
            group.addWidget(new qx.ui.basic.Label(result[i][0]));
            group.addWidget(new qx.ui.core.Spacer(), { flex: 1 });
            group.addWidget(new qx.ui.basic.Label(result[i][1]));

            that.permissionGroupsRoot.add(group);
          }
        },
        'get_grouplist',
        { detailed: true },
        "true",
        []
      );
    }
  }
});