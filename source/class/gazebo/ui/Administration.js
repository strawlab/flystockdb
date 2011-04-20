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

    var container = new qx.ui.tabview.TabView();

    var userContainer = new qx.ui.tabview.Page('Users');
    userContainer.setLayout(new qx.ui.layout.VBox(20));

    var groupContainer = new qx.ui.tabview.Page('Groups and Subscriptions');
    groupContainer.setLayout(new qx.ui.layout.VBox(20));

    var userNonButtonContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
    var groupNonButtonContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));

    // Control Buttons:

    this.userSubmitButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/dialog-ok.png');
    this.userAddButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/list-add.png');
    this.userDeleteButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/list-remove.png');

    var userAddDeleteSubmitContainer = new qx.ui.container.Composite();
    userAddDeleteSubmitContainer.setLayout(new qx.ui.layout.HBox(10));

    userAddDeleteSubmitContainer.add(this.userAddButton, { flex: 1 });
    userAddDeleteSubmitContainer.add(this.userDeleteButton, { flex: 1 });
    userAddDeleteSubmitContainer.add(this.userSubmitButton, { flex: 1 });

    userContainer.add(userAddDeleteSubmitContainer);

    this.groupSubmitButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/dialog-ok.png');
    this.groupAddButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/list-add.png');
    this.groupDeleteButton = new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/list-remove.png');

    var groupAddDeleteSubmitContainer = new qx.ui.container.Composite();
    groupAddDeleteSubmitContainer.setLayout(new qx.ui.layout.HBox(10));

    groupAddDeleteSubmitContainer.add(this.groupAddButton, { flex: 1 });
    groupAddDeleteSubmitContainer.add(this.groupDeleteButton, { flex: 1 });
    groupAddDeleteSubmitContainer.add(this.groupSubmitButton, { flex: 1 });

    groupContainer.add(groupAddDeleteSubmitContainer);

    // Lists, Textfields, Other Buttons:

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
      width: 130,
      readOnly: true
    });
    this.detailCreatedOn = new qx.ui.form.TextField().set({
      width: 130,
      readOnly: true
    });
    this.detailFirstName = new qx.ui.form.TextField().set({
      width: 130
    });
    this.detailLastName = new qx.ui.form.TextField().set({
      width: 130
    });
    this.detailEMail = new qx.ui.form.TextField().set({
      width: 260
    });
    this.detailOldPassword = new qx.ui.form.PasswordField().set({
      width: 100
    });
    this.detailNewPassword = new qx.ui.form.PasswordField().set({
      width: 100
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

    var userContainer2_1 = new qx.ui.container.Composite();
    userContainer2_1.setLayout(new qx.ui.layout.HBox(10));

    var userContainer2_1_1 = new qx.ui.container.Composite();
    userContainer2_1_1.setLayout(new qx.ui.layout.VBox(10));

    var userContainer2_1_2 = new qx.ui.container.Composite();
    userContainer2_1_2.setLayout(new qx.ui.layout.VBox(10));

    userContainer2_1_1.add(new qx.ui.basic.Label().set({
      value: 'Created By',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2_1_1.add(this.detailCreatedBy);
    userContainer2_1_2.add(new qx.ui.basic.Label().set({
      value: 'Created On',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2_1_2.add(this.detailCreatedOn);

    userContainer2_1.add(userContainer2_1_1);
    userContainer2_1.add(userContainer2_1_2);

    userContainer2.add(userContainer2_1);

    var userContainer2_2 = new qx.ui.container.Composite();
    userContainer2_2.setLayout(new qx.ui.layout.HBox(10));

    var userContainer2_2_1 = new qx.ui.container.Composite();
    userContainer2_2_1.setLayout(new qx.ui.layout.VBox(10));

    var userContainer2_2_2 = new qx.ui.container.Composite();
    userContainer2_2_2.setLayout(new qx.ui.layout.VBox(10));

    userContainer2_2_1.add(new qx.ui.basic.Label().set({
      value: 'First Name',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2_2_1.add(this.detailFirstName);

    userContainer2_2_2.add(new qx.ui.basic.Label().set({
      value: 'Last Name',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2_2_2.add(this.detailLastName);

    userContainer2_2.add(userContainer2_2_1);
    userContainer2_2.add(userContainer2_2_2);

    userContainer2.add(userContainer2_2);

    userContainer2.add(new qx.ui.basic.Label().set({
      value: 'E-Mail Address',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer2.add(this.detailEMail);

    var userContainer2_3 = new qx.ui.container.Composite();
    userContainer2_3.setLayout(new qx.ui.layout.HBox(10));

    //var userContainer2_3_1 = new qx.ui.container.Composite();
    //userContainer2_3_1.setLayout(new qx.ui.layout.VBox(10));

    //var userContainer2_3_2 = new qx.ui.container.Composite();
    //userContainer2_3_2.setLayout(new qx.ui.layout.VBox(10));

    var userContainer2_3_3 = new qx.ui.container.Composite();
    userContainer2_3_3.setLayout(new qx.ui.layout.HBox(10).set({
      alignY: 'middle'
    }));

    //userContainer2_3_1.add(new qx.ui.basic.Label().set({
    //  value: 'Current Password',
    //  rich: true,
    //  appearance: 'annotation'
    //}));
    //userContainer2_3_1.add(this.detailOldPassword);
    //userContainer2_3_1.add(userContainer2_3_1);
    
    //userContainer2_3_2.add(new qx.ui.basic.Label().set({
    //  value: 'New Password',
    //  rich: true,
    //  appearance: 'annotation'
    //}));
    //userContainer2_3_2.add(this.detailNewPassword);

    userContainer2_3_3.add(new qx.ui.form.Button(null, 'qx/icon/Oxygen/16/actions/mail-mark-unread.png'));
    userContainer2_3_3.add(new qx.ui.basic.Label().set({
      value: 'Reset Password',
      rich: true,
      appearance: 'annotation'
    }));

    //userContainer2_3.add(userContainer2_3_1);
    //userContainer2_3.add(userContainer2_3_2);

    //var pwdSeparator = new qx.ui.menu.Separator();
    //pwdSeparator.setDecorator('separator-horizontal');
    //pwdSeparator.setWidth(3);
    //userContainer2_3.add(pwdSeparator);

    userContainer2_3.add(userContainer2_3_3);

    userContainer2.add(userContainer2_3);

    this.detailDeactivated = new qx.ui.form.CheckBox("Login Deactivated / Blocked");
    this.userCreateUser = new qx.ui.form.CheckBox("Can Create Users");
    //this.userDeactivateUser = new qx.ui.form.CheckBox("Can Activate / Deactivate Users");
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
      width: 230,
      allowGrowY: true
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

    this.userDeleteGroup.magicMapping = true;
    this.userPermissions.magicMapping = true;

    userContainer2.add(new qx.ui.basic.Label().set({
      value: '<b>Rights & Permissions</b>',
      rich: true,
      appearance: 'annotation',
      paddingTop: 5
    }));
    userContainer2.add(this.detailDeactivated);
    userContainer2.add(this.userCreateUser);
    userContainer2.add(this.userCreateGroup);

    // TODO Rename. Was once in container 3, so mislabelled now.
    var userContainer3_2 = new qx.ui.container.Composite();
    userContainer3_2.setLayout(new qx.ui.layout.VBox(5));
    userContainer3_2.add(new qx.ui.basic.Label().set({
      value: 'Change User Permissions / Details'
    }));
    userContainer3_2.add(this.userPermissions);
    userContainer2.add(userContainer3_2);

    userContainer3.add(new qx.ui.basic.Label().set({
      value: '<b>Group-Subscription Overview</b>',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer3.add(this.userOverview, { flex: 1 });

    userNonButtonContainer.add(userContainer1);

    var userSeparator1 = new qx.ui.menu.Separator();
    userSeparator1.setDecorator('separator-horizontal');
    userSeparator1.setWidth(3);
    userNonButtonContainer.add(userSeparator1);

    userNonButtonContainer.add(userContainer2);

    userNonButtonContainer.add(new qx.ui.core.Spacer(3, 10));

    userNonButtonContainer.add(userContainer3);

    userContainer.add(userNonButtonContainer);

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
      width: 130,
      readOnly: true
    });
    this.groupCreatedOn = new qx.ui.form.TextField().set({
      width: 130,
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

    var groupContainer2_1 = new qx.ui.container.Composite();
    groupContainer2_1.setLayout(new qx.ui.layout.HBox(10));

    var groupContainer2_1_1 = new qx.ui.container.Composite();
    groupContainer2_1_1.setLayout(new qx.ui.layout.VBox(10));

    var groupContainer2_1_2 = new qx.ui.container.Composite();
    groupContainer2_1_2.setLayout(new qx.ui.layout.VBox(10));

    groupContainer2_1_1.add(new qx.ui.basic.Label().set({
      value: 'Created By',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2_1_1.add(this.groupCreatedBy);
    groupContainer2_1_2.add(new qx.ui.basic.Label().set({
      value: 'Created On',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2_1_2.add(this.groupCreatedOn);

    groupContainer2_1.add(groupContainer2_1_1);
    groupContainer2_1.add(groupContainer2_1_2);

    groupContainer2.add(groupContainer2_1);

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
    this.groupEditDelete = new qx.ui.form.SelectBox().set({
      width: 200
    });

    this.groupContribute.add(new qx.ui.form.ListItem("Only Its Group Administrators"));
    this.groupContribute.add(new qx.ui.form.ListItem("Only Its Administrators & Subscribers"));
    this.groupContribute.add(new qx.ui.form.ListItem("Everyone"));

    this.groupVisible.add(new qx.ui.form.ListItem("Only Group Administrators"));
    this.groupVisible.add(new qx.ui.form.ListItem("Only Administrators &  Subscribers"));
    this.groupVisible.add(new qx.ui.form.ListItem("Everyone"));

    this.groupEditDelete.add(new qx.ui.form.ListItem("Only Its Creator"));
    this.groupEditDelete.add(new qx.ui.form.ListItem("Only Its Group Administrators"));
    this.groupEditDelete.add(new qx.ui.form.ListItem("Only Its Administrators & Subscribers"));
    this.groupEditDelete.add(new qx.ui.form.ListItem("Everyone"));

    this.groupContribute.magicMapping = true;
    this.groupVisible.magicMapping = true;
    this.groupEditDelete.magicMapping = true;

    this.groupAdminAndSubscriptions = new qx.ui.tree.Tree().set({
      hideRoot: true,
      width: 230
    });
    this.groupAASRoot = new qx.ui.tree.TreeFolder().set({
      open: true
    });
    this.groupAdminAndSubscriptions.setRoot(this.groupAASRoot);

    groupContainer2.add(new qx.ui.basic.Label().set({
      value: '<b>Rights, Permissions & Subscriptions</b>',
      rich: true,
      appearance: 'annotation',
      paddingTop: 5
    }));
    groupContainer2.add(new qx.ui.basic.Label().set({
      value: 'Visibility',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(this.groupVisible);
    groupContainer2.add(new qx.ui.basic.Label().set({
      value: 'Contributors',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(this.groupContribute);
    groupContainer2.add(new qx.ui.basic.Label().set({
      value: 'Editable and Deletable',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(this.groupEditDelete);

    groupContainer3.add(new qx.ui.basic.Label().set({
      value: '<b>Administrators & Subscribers</b>',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer3.add(this.groupAdminAndSubscriptions, { flex: 1 });

    groupNonButtonContainer.add(groupContainer1);

    var groupSeparator1 = new qx.ui.menu.Separator();
    groupSeparator1.setDecorator('separator-horizontal');
    groupSeparator1.setWidth(3);
    groupNonButtonContainer.add(groupSeparator1);

    groupNonButtonContainer.add(groupContainer2);

    groupNonButtonContainer.add(new qx.ui.core.Spacer(3, 10));

    groupNonButtonContainer.add(groupContainer3);

    groupContainer.add(groupNonButtonContainer);
    
    // Tabs:
    container.add(groupContainer);
    container.add(userContainer);

    this.add(container);

    this.userList.addListener('changeSelection',
      function(selectionEvent) {
        var username;

        if (selectionEvent &&
          selectionEvent.getData() &&
          selectionEvent.getData().length >= 1) {
          var firstSelection = selectionEvent.getData()[0];

          // Check if selected element is not null. Otherwise crashes
          // when calling removeAll on the list.
          if (!firstSelection) {
            return;
          }
          
          username = firstSelection.getLabel();

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
              this.userPermissions
            ],
            'get_userdetails',
            username
          );
        }
      },
      this
    );

    this.userList.addListener('changeSelection',
      this.updateUserOverview,
      this
    );

    this.groupList.addListener('changeSelection',
      function(selectionEvent) {
        var name;

        if (selectionEvent &&
          selectionEvent.getData() &&
          selectionEvent.getData().length >= 1) {
          var firstSelection = selectionEvent.getData()[0];

          // Check if selected element is not null. Otherwise crashes
          // when calling removeAll on the list.
          if (!firstSelection) {
            return;
          }

          name = firstSelection.getLabel();

          this.populateInputFields(
            [
              this.groupName,
              null,
              this.groupCreatedBy,
              this.groupCreatedOn,
              this.groupContact,
              this.groupDescription,
              this.groupContribute,
              this.groupVisible,
              this.groupEditDelete
            ],
            'get_groupdetails',
            name
          );
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

    //var userSeparator2 = new qx.ui.menu.Separator();
    //userSeparator2.setDecorator('separator-horizontal');
    //userSeparator2.setWidth(3);
    //userContainer.add(userSeparator2);

    //var groupSeparator2 = new qx.ui.menu.Separator();
    //groupSeparator2.setDecorator('separator-horizontal');
    //groupSeparator2.setWidth(3);
    //groupContainer.add(groupSeparator2);

    this.username.addListener('changeValue', this.setUserButtons, this);
    this.groupName.addListener('changeValue', this.setGroupButtons, this);

    this.userSubmitButton.addListener('execute',
      function() {
        // TODO Check validity of user input

        var rpc = new qx.io.remote.Rpc();
        rpc.setTimeout(gazebo.Application.timeout);
        rpc.setUrl(gazebo.Application.getServerURL());
        rpc.setServiceName("gazebo.cgi");

        rpc.callAsync(
          function(result, ex, id)
          {

          },
          'update_user',
          {},
          this.username.getValue(),
          [
            this.detailFirstName.getValue(),
            this.detailLastName.getValue(),
            this.detailEMail.getValue().replace("@", "@@"), // Workaround
            this.detailDeactivated.getValue(),
            this.userCreateUser.getValue(),
            this.userCreateGroup.getValue(),
            this.selectionPosition(this.userPermissions)
          ]
        );
      },
      this
    );

    this.userAddButton.addListener('execute',
      function() {
        // TODO Check validity of user input

        var rpc = new qx.io.remote.Rpc();
        rpc.setTimeout(gazebo.Application.delayedTimeout);
        rpc.setUrl(gazebo.Application.getServerURL());
        rpc.setServiceName("gazebo.cgi");

        var that = this;

        rpc.callAsync(
          function(result, ex, id)
          {
            that.populateList(that.userList, 'get_userlist', 'username');
          },
          'create_user',
          {
            generate_password: true
            //email_to: this.detailEMail.getValue()
          },
          [
            this.username.getValue(),
            this.detailFirstName.getValue(),
            this.detailLastName.getValue(),
            this.detailEMail.getValue().replace("@", "@@"), // Workaround
            this.detailDeactivated.getValue(),
            this.userCreateUser.getValue(),
            this.userCreateGroup.getValue(),
            this.selectionPosition(this.userPermissions)
          ]
        );          
      },
      this
    );

    this.groupSubmitButton.addListener('execute',
      function() {
        // TODO Check validity of user input

        var rpc = new qx.io.remote.Rpc();
        rpc.setTimeout(gazebo.Application.timeout);
        rpc.setUrl(gazebo.Application.getServerURL());
        rpc.setServiceName("gazebo.cgi");

        rpc.callAsync(
          function(result, ex, id)
          {

          },
          'update_group',
          {},
          this.groupName.getValue(),
          [
            this.groupContact.getSelection()[0].getLabel(), // TODO Always there?
            this.groupDescription.getValue(),
            this.selectionPosition(this.groupContribute),
            this.selectionPosition(this.groupVisible),
            this.selectionPosition(this.groupEditDelete)
          ]
        );

        var assignments = []
        var list = this.groupAASRoot.getChildren();

        // Skip header.. so, start with 1!
        for (var i = 1; i < list.length; i++) {
          assignments.push(list[i].model_workaround_call());
        }

        rpc.callAsync(
          function(result, ex, id)
          {

          },
          'update_subscriptions',
          {},
          this.groupName.getValue(),
          assignments
        );
      },
      this
    );

    this.groupAddButton.addListener('execute',
      function() {
        // TODO Check validity of user input

        var rpc = new qx.io.remote.Rpc();
        rpc.setTimeout(gazebo.Application.delayedTimeout);
        rpc.setUrl(gazebo.Application.getServerURL());
        rpc.setServiceName("gazebo.cgi");

        var that = this;

        rpc.callAsync(
          function(result, ex, id)
          {
            that.populateList(that.groupList, 'get_grouplist', 'name');
          },
          'create_group',
          {
          },
          [
            this.groupName.getValue(),
            this.groupContact.getSelection()[0].getLabel(), // TODO Always there?
            this.groupDescription.getValue(),
            this.selectionPosition(this.groupContribute),
            this.selectionPosition(this.groupVisible),
            this.selectionPosition(this.groupEditDelete)
          ]
        );
      },
      this
    );

  },

  members :
  {
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

    // TODO Should call removeAll() on destination, but that bails out with an error.
    populateList : function(destination, request, column)
    {
      var rpc = new qx.io.remote.Rpc();
      rpc.setTimeout(gazebo.Application.timeout);
      rpc.setUrl(gazebo.Application.getServerURL());
      rpc.setServiceName("gazebo.cgi");

      rpc.callAsync(
        function(result, ex, id)
        {
          if (!result || result.length == 0) {
            // TODO Retry and eventually error handling..
            return;
          }

          if (!destination) { return; }
          
          destination.removeAll();

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
      rpc.setTimeout(gazebo.Application.timeout);
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

              if (result[0][i] < selectables.length) {
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
      rpc.setTimeout(gazebo.Application.timeout);
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
          header.addWidget(new qx.ui.core.Spacer(7));
          header.addWidget(new qx.ui.basic.Label('Adm.'));

          that.userOverviewRoot.add(header);

          for (var i = 0; i < result.length; i++) {
            var group = new qx.ui.tree.TreeFile();

            isCreator = new qx.ui.form.CheckBox();
            isCreator.setFocusable(false);
            isCreator.setEnabled(false);

            if (result[i][1] == that.username.getValue()) {
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
            group.addWidget(new qx.ui.core.Spacer(26));
            group.addWidget(adminCheckbox);
            group.addWidget(new qx.ui.core.Spacer(4));

            that.userOverviewRoot.add(group);
          }
        },
        'get_usersubscriptions',
        {},
        "g.group_id == s.group_id AND s.username = ?", // TODO Why do I need ==?
        [ that.username.getValue() ]
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

          that.groupAASRoot.removeAll();
          
          var header = new qx.ui.tree.TreeFile();
          
          header.addWidget(new qx.ui.basic.Label(''));
          header.addWidget(new qx.ui.core.Spacer(), { flex: 1 });
          header.addWidget(new qx.ui.basic.Label('Adm.'));
          header.addWidget(new qx.ui.core.Spacer(15));
          header.addWidget(new qx.ui.basic.Label('Subs.'));

          that.groupAASRoot.add(header);

          for (var i = 0; i < result.length; i++) {
            that.groupAASRoot.add(that.generateSubscriptionItem(result[i][0], result[i][1], result[i][1] != null));
          }
        },
        'get_groupsubscriptions',
        { comprehensive: true },
        "u.username == s.username AND s.group_id = ?",
        [ group_id ]
      );
    },

    generateSubscriptionItem : function(username, isAdmin, isSubscribed)
    {
      var item = new qx.ui.tree.TreeFile();

      var usernameLabel = new qx.ui.basic.Label(username);
      item.addWidget(usernameLabel);

      var adminCheckbox = new qx.ui.form.CheckBox();
      adminCheckbox.setFocusable(false);
      var subscriptionCheckbox = new qx.ui.form.CheckBox();
      subscriptionCheckbox.setFocusable(false);

      if (isSubscribed) {
        subscriptionCheckbox.setValue(true);

        if (isAdmin) {
          adminCheckbox.setValue(true);
        }
      }

      item.addWidget(new qx.ui.core.Spacer(), { flex: 1 });
      item.addWidget(adminCheckbox);
      item.addWidget(new qx.ui.core.Spacer(29));
      item.addWidget(subscriptionCheckbox);
      item.addWidget(new qx.ui.core.Spacer(8));

      item.model_workaround_call = function() {
        return [ usernameLabel.getValue(), adminCheckbox.getValue(), subscriptionCheckbox.getValue() ];
      };

      return item;
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