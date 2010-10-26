/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/* ************************************************************************

#asset(gazebo/*)

************************************************************************ */

/**
 * Interface for setting up a database connection or dealing
 * with use authentication.
 */
qx.Class.define("gazebo.ui.Administration",
{
  extend : qx.ui.container.Composite,

  construct : function(parameters, listeners, overrides)
  {
    this.base(arguments);

    this.inquirer = parameters['inquirer'];

		this.setLayout(new qx.ui.layout.HBox(5));

    var container = new qx.ui.container.Composite().set();
    container.setLayout(new qx.ui.layout.VBox(10));

    var userContainer = new qx.ui.container.Composite();
    userContainer.setLayout(new qx.ui.layout.HBox(20));

    var userContainer1 = new qx.ui.container.Composite();
    userContainer1.setLayout(new qx.ui.layout.VBox(10));

    var userContainer2 = new qx.ui.container.Composite();
    userContainer2.setLayout(new qx.ui.layout.VBox(10));

    var userContainer3 = new qx.ui.container.Composite();
    userContainer3.setLayout(new qx.ui.layout.VBox(10));

    userContainer1.add(new qx.ui.basic.Label().set({
      value: '<b>User List</b>',
      rich: true,
      appearance: 'annotation'
    }));
    this.userList = new qx.ui.form.List().set({
      width: 200
    });
    userContainer1.add(this.userList, { flex: 1 });

    this.username = new qx.ui.form.TextField().set({
      width: 260,
      liveUpdate: true
    });
    this.detailCreatedBy = new qx.ui.form.TextField().set({
      width: 260,
      readOnly: true
    });
    this.detailCreatedOn = new qx.ui.form.TextField().set({
      width: 260,
      readOnly: true
    });
    this.detailFirstName = new qx.ui.form.TextField().set({
      width: 260
    });
    this.detailLastName = new qx.ui.form.TextField().set({
      width: 260
    });
    this.detailEMail = new qx.ui.form.TextField().set({
      width: 260
    });

    userContainer2.add(new qx.ui.basic.Label().set({
      value: '<b>Details</b>',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2.add(new qx.ui.basic.Label().set({
      value: 'Username',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2.add(this.username);
    userContainer2.add(new qx.ui.basic.Label().set({
      value: 'Created By',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2.add(this.detailCreatedBy);
    userContainer2.add(new qx.ui.basic.Label().set({
      value: 'Created On',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2.add(this.detailCreatedOn);
    userContainer2.add(new qx.ui.basic.Label().set({
      value: 'First Name',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2.add(this.detailFirstName);
    userContainer2.add(new qx.ui.basic.Label().set({
      value: 'Last Name',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2.add(this.detailLastName);
    userContainer2.add(new qx.ui.basic.Label().set({
      value: 'E-Mail Address',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2.add(this.detailEMail);

    this.detailDeactivated = new qx.ui.form.CheckBox("Login Deactivated / Blocked");
    this.userCreateUser = new qx.ui.form.CheckBox("Can Create Users");
    this.userDeactivateUser = new qx.ui.form.CheckBox("Can Deactivate Users");
    this.userCreateGroup = new qx.ui.form.CheckBox("Can Create Groups");
    //this.userUnsubscribe = new qx.ui.form.CheckBox("Unsubscribe from Groups");
    this.userDeleteGroup = new qx.ui.form.SelectBox().set({
      width: 200
    });
    this.userPermissions = new qx.ui.form.SelectBox().set({
      width: 200
    });
    //this.userModify = new qx.ui.form.SelectBox().set({
    //  width: 200
    //});
    //this.userSubscriptions = new qx.ui.form.SelectBox().set({
    //  width: 200
    //});
    this.userOverview = new qx.ui.tree.Tree().set({
      hideRoot: true,
      height: 110
    });
    this.userOverviewRoot = new qx.ui.tree.TreeFolder().set({
      open: true
    });
    this.userOverview.setRoot(this.userOverviewRoot);



    this.userDeleteGroup.add(new qx.ui.form.ListItem("Not Allowed"));
    this.userDeleteGroup.add(new qx.ui.form.ListItem("Created Groups"));
    this.userDeleteGroup.add(new qx.ui.form.ListItem("Administered Groups"));
    this.userDeleteGroup.add(new qx.ui.form.ListItem("All Groups"));

    this.userPermissions.add(new qx.ui.form.ListItem("Not Allowed"));
    this.userPermissions.add(new qx.ui.form.ListItem("Created Users"));
    this.userPermissions.add(new qx.ui.form.ListItem("All Users"));

    //this.userModify.add(new qx.ui.form.ListItem("Not Allowed"));
    //this.userModify.add(new qx.ui.form.ListItem("Created Users"));
    //this.userModify.add(new qx.ui.form.ListItem("All Users"));

    this.userDeleteGroup.magicMapping = true;
    this.userPermissions.magicMapping = true;
    //this.userModify.magicMapping = true;

    userContainer3.add(new qx.ui.basic.Label().set({
      value: '<b>Rights & Permissions</b>',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer3.add(this.detailDeactivated);
    userContainer3.add(this.userCreateUser);
    userContainer3.add(this.userDeactivateUser);
    userContainer3.add(this.userCreateGroup);
    
    var userContainer3_1 = new qx.ui.container.Composite();
    userContainer3_1.setLayout(new qx.ui.layout.VBox(5));
    userContainer3_1.add(new qx.ui.basic.Label().set({
      value: 'Delete Groups'
    }));
    userContainer3_1.add(this.userDeleteGroup);
    userContainer3.add(userContainer3_1);

    var userContainer3_2 = new qx.ui.container.Composite();
    userContainer3_2.setLayout(new qx.ui.layout.VBox(5));
    userContainer3_2.add(new qx.ui.basic.Label().set({
      value: 'Change User Permissions / Details'
    }));
    userContainer3_2.add(this.userPermissions);
    userContainer3.add(userContainer3_2);

    //var userContainer3_3 = new qx.ui.container.Composite();
    //userContainer3_3.setLayout(new qx.ui.layout.VBox(5));
    //userContainer3_3.add(new qx.ui.basic.Label().set({
    //  value: 'Modify User Details'
    //}));
    //userContainer3_3.add(this.userModify);
    //userContainer3.add(userContainer3_3);

    //var userContainer3_4 = new qx.ui.container.Composite();
    //userContainer3_4.setLayout(new qx.ui.layout.VBox(5));
    //userContainer3_4.add(new qx.ui.basic.Label().set({
    //  value: 'Subscriptions (viewable list only)'
    //}));
    //userContainer3_4.add(this.userSubscriptions);
    //userContainer3.add(userContainer3_4);

    var userContainer3_3 = new qx.ui.container.Composite();
    userContainer3_3.setLayout(new qx.ui.layout.VBox(5));
    userContainer3_3.add(new qx.ui.basic.Label().set({
      value: 'Overview of Your Groups'
    }));
    userContainer3_3.add(this.userOverview);
    userContainer3.add(userContainer3_3);

    userContainer.add(userContainer1);

    var userSeparator1 = new qx.ui.menu.Separator();
    userSeparator1.setDecorator('separator-horizontal');
    userSeparator1.setWidth(3);
    userContainer.add(userSeparator1);

    userContainer.add(userContainer2);

    userContainer.add(new qx.ui.core.Spacer(3, 10));

    userContainer.add(userContainer3);

    container.add(userContainer);

    var groupContainer = new qx.ui.container.Composite();
    groupContainer.setLayout(new qx.ui.layout.HBox(20));

    var groupContainer1 = new qx.ui.container.Composite();
    groupContainer1.setLayout(new qx.ui.layout.VBox(10));

    var groupContainer2 = new qx.ui.container.Composite();
    groupContainer2.setLayout(new qx.ui.layout.VBox(10));

    var groupContainer3 = new qx.ui.container.Composite();
    groupContainer3.setLayout(new qx.ui.layout.VBox(10));

    groupContainer1.add(new qx.ui.basic.Label().set({
      value: '<b>Group List</b>',
      rich: true,
      appearance: 'annotation'
    }));
    this.groupList = new qx.ui.form.List().set({
      width: 200
    });
    groupContainer1.add(this.groupList, { flex: 1 });

    this.groupCreatedBy = new qx.ui.form.TextField().set({
      width: 260,
      readOnly: true
    });
    this.groupCreatedOn = new qx.ui.form.TextField().set({
      width: 260,
      readOnly: true
    });
    this.groupContact = new qx.ui.form.SelectBox();
    this.groupName = new qx.ui.form.TextField().set({
      width: 260,
      liveUpdate: true
    });
    this.groupDescription = new qx.ui.form.TextField().set({
      width: 260
    });

    groupContainer2.add(new qx.ui.basic.Label().set({
      value: '<b>Details</b>',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(new qx.ui.basic.Label().set({
      value: 'Group Name',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(this.groupName);
    groupContainer2.add(new qx.ui.basic.Label().set({
      value: 'Created By',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(this.groupCreatedBy);
    groupContainer2.add(new qx.ui.basic.Label().set({
      value: 'Created On',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(this.groupCreatedOn);
    groupContainer2.add(new qx.ui.basic.Label().set({
      value: 'Contact',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(this.groupContact);
    groupContainer2.add(new qx.ui.basic.Label().set({
      value: 'Description',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(this.groupDescription);

    this.groupContribute = new qx.ui.form.SelectBox().set({
      width: 200
    });
    this.groupVisible = new qx.ui.form.SelectBox().set({
      width: 200
    });

    this.groupContribute.add(new qx.ui.form.ListItem("Only Its Group Administrators"));
    this.groupContribute.add(new qx.ui.form.ListItem("Only Its Administrators & Subscribers"));
    this.groupContribute.add(new qx.ui.form.ListItem("Everyone"));

    this.groupVisible.add(new qx.ui.form.ListItem("Only Group Administrators"));
    this.groupVisible.add(new qx.ui.form.ListItem("Only Administrators &  Subscribers"));
    this.groupVisible.add(new qx.ui.form.ListItem("Everyone"));

    this.groupContribute.magicMapping = true;
    this.groupVisible.magicMapping = true;

    this.groupAdminAndSubscriptions = new qx.ui.tree.Tree().set({
      hideRoot: true,
      height: 140
    });
    this.groupAASRoot = new qx.ui.tree.TreeFolder().set({
      open: true
    });
    this.groupAdminAndSubscriptions.setRoot(this.groupAASRoot);

    groupContainer3.add(new qx.ui.basic.Label().set({
      value: '<b>Rights, Permissions & Subscriptions</b>',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer3.add(new qx.ui.basic.Label().set({
      value: 'Visibility',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer3.add(this.groupVisible);
    groupContainer3.add(new qx.ui.basic.Label().set({
      value: 'Contributors',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer3.add(this.groupContribute);

    groupContainer3.add(new qx.ui.basic.Label().set({
      value: 'Administrators & Subscribers',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer3.add(this.groupAdminAndSubscriptions);

    groupContainer.add(groupContainer1);

    var groupSeparator1 = new qx.ui.menu.Separator();
    groupSeparator1.setDecorator('separator-horizontal');
    groupSeparator1.setWidth(3);
    groupContainer.add(groupSeparator1);

    groupContainer.add(groupContainer2);

    groupContainer.add(new qx.ui.core.Spacer(3, 10));

    groupContainer.add(groupContainer3);

    container.add(new qx.ui.core.Spacer(10,8));
    container.add(new qx.ui.basic.Label().set({
      value: 'Group Administration',
      rich: true,
      appearance: 'window/title',
      textColor: 'text-gray'
    }));
    var groupSeparator = new qx.ui.menu.Separator();
    groupSeparator.setDecorator('separator-vertical');
    container.add(groupSeparator);

    container.add(groupContainer);

    this.add(container);

    this.userList.addListener('changeSelection',
      function(selectionEvent) {
        var username;
        
        if (selectionEvent && selectionEvent.getData()) {
          username = selectionEvent.getData()[0].getLabel();

          this.populateInputFields(
            [
              this.username,
              this.detailCreatedBy,
              this.detailCreatedOn,
              this.detailFirstName,
              this.detailLastName,
              this.detailEMail,
              this.detailDeactivated,
              this.userCreateUser,
              this.userCreateGroup,
              this.userDeactivateUser,
              this.userPermissions
            ],
            'get_userdetails',
            username
          );
        }
      },
      this
    );

    //this.userList.addListener('changeSelection',
    //  this.updateUserOverview,
    //  this
    //);

    this.groupList.addListener('changeSelection',
      function(selectionEvent) {
        var name;

        if (selectionEvent && selectionEvent.getData()) {
          name = selectionEvent.getData()[0].getLabel();

          this.populateInputFields(
            [
              this.groupName,
              null,
              this.groupCreatedBy,
              this.groupCreatedOn,
              this.groupContact,
              this.groupDescription,
              this.groupContribute,
              this.groupVisible
            ],
            'get_groupdetails',
            name
          );
        }
      },
      this
    );

    this.groupList.addListener('changeSelection',
      function(selectionEvent) {
        var name;

        if (selectionEvent && selectionEvent.getData()) {
          name = selectionEvent.getData()[0].getLabel();
        }
      },
      this
    );

    // Populate user-list:
    this.populateList(this.userList, 'get_userlist', 'username');

    // Populate group-list:
    this.populateList(this.groupList, 'get_grouplist', 'name');

    // Populate group-contact list:
    this.groupContact.add(new qx.ui.form.ListItem(''));
    this.populateList(this.groupContact, 'get_userlist', 'username');

    var userSeparator2 = new qx.ui.menu.Separator();
    userSeparator2.setDecorator('separator-horizontal');
    userSeparator2.setWidth(3);
    userContainer.add(userSeparator2);

    this.userSubmitButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/dialog-ok.png');
    this.userAddButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/list-add.png');
    this.userDeleteButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/list-remove.png');

    var userAddDeleteContainer = new qx.ui.container.Composite();
    userAddDeleteContainer.setLayout(new qx.ui.layout.VBox(10));

    userAddDeleteContainer.add(this.userAddButton, { flex: 1 });
    userAddDeleteContainer.add(this.userDeleteButton, { flex: 1 });

    userContainer.add(userAddDeleteContainer);
    userContainer.add(this.userSubmitButton);

    var groupSeparator2 = new qx.ui.menu.Separator();
    groupSeparator2.setDecorator('separator-horizontal');
    groupSeparator2.setWidth(3);
    groupContainer.add(groupSeparator2);

    this.groupSubmitButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/dialog-ok.png');
    this.groupAddButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/list-add.png');
    this.groupDeleteButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/list-remove.png');

    var groupAddDeleteContainer = new qx.ui.container.Composite();
    groupAddDeleteContainer.setLayout(new qx.ui.layout.VBox(10));

    groupAddDeleteContainer.add(this.groupAddButton, { flex: 1 });
    groupAddDeleteContainer.add(this.groupDeleteButton, { flex: 1 });

    groupContainer.add(groupAddDeleteContainer);
    groupContainer.add(this.groupSubmitButton);

    this.username.addListener('changeValue', this.setUserButtons, this);
    this.groupName.addListener('changeValue', this.setGroupButtons, this);
  },

  members :
  {
    populateList : function(destination, request, column)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(2000); // 2sec time-out, arbitrarily chosen.
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      rpc.callAsync(
        function(result, ex, id)
        {
          if (!result || result.length == 0) {
            // TODO Retry and eventually error handling..
            return;
          }

          for (var i = 0; i < result.length; i++) {
            destination.add(new qx.ui.form.ListItem(result[i][0]));
          }
        },
        request,
        { orderby: column },
        "true",
        []
      );
    },

    populateInputFields : function(fields, request, argument, failover)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(2000); // 2sec time-out, arbitrarily chosen.
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      rpc.callAsync(
        function(result, ex, id)
        {
          if (!result || result.length != 1) {
            // TODO Retry and eventually error handling..
            if (failover) {
              failover(result);
            }
            return;
          }

          if (result[0].length < fields.length) {
            // TODO Woops...
          }

          for (var i = 0; i < fields.length; i++) {
            var selectables;

            if (!fields[i]) {
              // Do nothing.
            } else if (fields[i].magicMapping) {
              selectables = fields[i].getSelectables(true);

              if (result[0][i] && result[0][i] < selectables.length) {
                fields[i].setSelection([ selectables[ result[0][i] ] ]);
              } else {
                // TODO Woops...
              }
            } else if (fields[i].setValue) {
              fields[i].setValue(result[0][i]);
            } else if (fields[i].setSelection) {
              selectables = fields[i].getSelectables(true);

              for (var j = 0; j < selectables.length; j++) {
                if (selectables[j].getLabel() == result[0][i]) {
                  fields[i].setSelection([ selectables[j] ]);
                  break;
                }
              }
            } else {
              fields[i](result);
            }
          }
        },
        request,
        {},
        argument
      );
    },

    setUserButtons : function()
    {
      var that = this;

      this.populateInputFields(
        [
          function(result) {
            if (result && result.length > 0 && result[0][0] == that.username.getValue()) {
              that.userSubmitButton.setEnabled(true);
              that.userAddButton.setEnabled(false);
              that.userDeleteButton.setEnabled(true);

              that.detailCreatedBy.setValue(result[0][1]);
              that.detailCreatedOn.setValue(result[0][2]);

              that.updateUserOverview(result[0][0]);
            }
          }
        ],
        'get_userdetails',
        this.username.getValue(),
        function(result) {
          that.userSubmitButton.setEnabled(false);
          that.userAddButton.setEnabled(true);
          that.userDeleteButton.setEnabled(false);
          that.inquirer.generateAuthenticationDispatcher(
            {},
            {
              'onAuthenticationSuccess': { call: that.updateUserUsername, context: that },
              'onAuthenticationFailure': { call: that.updateUserUsername, context: that }
            },
            {}
          );
          that.detailCreatedOn.setValue('');
          that.userOverviewRoot.removeAll();
        }
      );
    },

    updateUserUsername : function(dataEvent)
    {
      var status = dataEvent.getData();

      if (status && status['logged_in']) {
        this.detailCreatedBy.setValue(status['username']);
      }
    },

    updateUserOverview : function(username) {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(2000); // 2sec time-out, arbitrarily chosen.
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      var that = this;

      rpc.callAsync(
        function(result, ex, id)
        {
          that.userOverviewRoot.removeAll();

          if (!result || result.length == 0) {
            // TODO Retry and eventually error handling..
            return;
          }

          var header = new qx.ui.tree.TreeFile();

          header.addWidget(new qx.ui.core.Spacer(), { flex: 1 });
          header.addWidget(new qx.ui.basic.Label('Creator'));
          header.addWidget(new qx.ui.core.Spacer(15));
          header.addWidget(new qx.ui.basic.Label('Adm.'));

          that.userOverviewRoot.add(header);

          for (var i = 0; i < result.length; i++) {
            var group = new qx.ui.tree.TreeFile();

            isCreator = new qx.ui.form.CheckBox();
            isCreator.setFocusable(false);
            isCreator.setEnabled(false);

            if (result[i][1] == 'administrator') {
              isCreator.setValue(true);
            }

            adminCheckbox = new qx.ui.form.CheckBox();
            adminCheckbox.setFocusable(false);
            adminCheckbox.setEnabled(false);

            if (result[i][2]) {
              adminCheckbox.setValue(true);
            }

            group.addWidget(new qx.ui.basic.Label(result[i][0]));
            group.addWidget(new qx.ui.core.Spacer(), { flex: 1 });
            group.addWidget(isCreator);
            group.addWidget(new qx.ui.core.Spacer(35));
            group.addWidget(adminCheckbox);
            group.addWidget(new qx.ui.core.Spacer(8));

            that.userOverviewRoot.add(group);
          }
        },
        'get_usersubscriptions',
        {},
        "g.group_id == s.group_id AND s.username = ?", // TODO Why do I need ==?
        [ 'administrator' ]
      );
    },

    updateGroupUsername : function(dataEvent)
    {
      var status = dataEvent.getData();

      if (status && status['logged_in']) {
        this.groupCreatedBy.setValue(status['username']);
      }
    },

    updateSubscriptions : function(group_id)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(2000); // 2sec time-out, arbitrarily chosen.
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

          that.groupAASRoot.removeAll();
          
          var header = new qx.ui.tree.TreeFile();
          
          header.addWidget(new qx.ui.basic.Label(''));
          header.addWidget(new qx.ui.core.Spacer(), { flex: 1 });
          header.addWidget(new qx.ui.basic.Label('Adm.'));
          header.addWidget(new qx.ui.core.Spacer(15));
          header.addWidget(new qx.ui.basic.Label('Subs.'));

          that.groupAASRoot.add(header);

          for (var i = 0; i < result.length; i++) {
            var group = new qx.ui.tree.TreeFile();

            group.addWidget(new qx.ui.basic.Label(result[i][0]));

            var adminCheckbox = new qx.ui.form.CheckBox();
            adminCheckbox.setFocusable(false);
            var subscriptionCheckbox = new qx.ui.form.CheckBox();
            subscriptionCheckbox.setFocusable(false);

            if (result[i][1] != null) {
              subscriptionCheckbox.setValue(true);

              if (result[i][1]) {
                adminCheckbox.setValue(true);
              }
            }

            group.addWidget(new qx.ui.core.Spacer(), { flex: 1 });
            group.addWidget(adminCheckbox);
            group.addWidget(new qx.ui.core.Spacer(29));
            group.addWidget(subscriptionCheckbox);
            group.addWidget(new qx.ui.core.Spacer(8));

            that.groupAASRoot.add(group);
          }
        },
        'get_groupsubscriptions',
        { comprehensive: true },
        "u.username == s.username AND s.group_id = ?",
        [ group_id ]
      );
    },

    setGroupButtons : function()
    {
      var that = this;

      this.populateInputFields(
        [
          function(result) {
            if (result && result.length > 0 && result[0][0] == that.groupName.getValue()) {
              that.groupSubmitButton.setEnabled(true);
              that.groupAddButton.setEnabled(false);
              that.groupDeleteButton.setEnabled(true);

              that.groupCreatedBy.setValue(result[0][2]);
              that.groupCreatedOn.setValue(result[0][3]);

              that.updateSubscriptions(result[0][1]);
            }
          }
        ],
        'get_groupdetails',
        this.groupName.getValue(),
        function(result) {
          that.groupSubmitButton.setEnabled(false);
          that.groupAddButton.setEnabled(true);
          that.groupDeleteButton.setEnabled(false);
          that.inquirer.generateAuthenticationDispatcher(
            {},
            {
              'onAuthenticationSuccess': { call: that.updateGroupUsername, context: that },
              'onAuthenticationFailure': { call: that.updateGroupUsername, context: that }
            },
            {}
          );
          that.groupCreatedOn.setValue('');

          that.groupAASRoot.removeAll();
          var note = new qx.ui.tree.TreeFile('Add group first (green button)', null);
          that.groupAASRoot.add(note);
        }
      );
    }
  }
});