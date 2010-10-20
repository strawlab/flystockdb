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
		this.setLayout(new qx.ui.layout.HBox(5));

    var container = new qx.ui.container.Composite().set();
    container.setLayout(new qx.ui.layout.VBox(10));

    var userContainer = new qx.ui.container.Composite();
    userContainer.setLayout(new qx.ui.layout.HBox(10));

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
      width: 260
    });
    this.detailCreatedBy = new qx.ui.form.TextField().set({
      width: 260
    });
    this.detailCreatedOn = new qx.ui.form.TextField().set({
      width: 260
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
    this.detailDeactivated = new qx.ui.form.CheckBox("Login Deactivated / Blocked");

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
    userContainer2.add(this.detailDeactivated);

    this.userCreateUser = new qx.ui.form.CheckBox("Create Users");
    this.userDeactivateUser = new qx.ui.form.CheckBox("Deactivate Users");
    this.userCreateGroup = new qx.ui.form.CheckBox("Create Groups");
    this.userUnsubscribe = new qx.ui.form.CheckBox("Unsubscribe from Groups");
    this.userDeleteGroup = new qx.ui.form.SelectBox().set({
      width: 200
    }); // none, admin, all
    this.userPermissions = new qx.ui.form.SelectBox().set({
      width: 200
    }); // none, created user, all
    this.userModify = new qx.ui.form.SelectBox().set({
      width: 200
    }); // none, created user, all

    this.userDeleteGroup.add(new qx.ui.form.ListItem("Not Allowed"));
    this.userDeleteGroup.add(new qx.ui.form.ListItem("Administered Groups"));
    this.userDeleteGroup.add(new qx.ui.form.ListItem("All Groups"));

    this.userPermissions.add(new qx.ui.form.ListItem("Not Allowed"));
    this.userPermissions.add(new qx.ui.form.ListItem("Created Users"));
    this.userPermissions.add(new qx.ui.form.ListItem("All Users"));

    this.userModify.add(new qx.ui.form.ListItem("Not Allowed"));
    this.userModify.add(new qx.ui.form.ListItem("Created Users"));
    this.userModify.add(new qx.ui.form.ListItem("All Users"));

    userContainer3.add(new qx.ui.basic.Label().set({
      value: '<b>Rights & Permissions</b>',
      rich: true,
      appearance: 'annotation'
    }));
    userContainer3.add(this.userCreateUser);
    userContainer3.add(this.userDeactivateUser);
    userContainer3.add(this.userCreateGroup);
    userContainer3.add(this.userUnsubscribe);
    
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
      value: 'Change User Permissions'
    }));
    userContainer3_2.add(this.userPermissions);
    userContainer3.add(userContainer3_2);

    var userContainer3_3 = new qx.ui.container.Composite();
    userContainer3_3.setLayout(new qx.ui.layout.VBox(5));
    userContainer3_3.add(new qx.ui.basic.Label().set({
      value: 'Modify User Details'
    }));
    userContainer3_3.add(this.userModify);
    userContainer3.add(userContainer3_3);

    userContainer.add(userContainer1);
    userContainer.add(userContainer2);
    userContainer.add(userContainer3);

    container.add(userContainer);

    var groupContainer = new qx.ui.container.Composite();
    groupContainer.setLayout(new qx.ui.layout.HBox(10));

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
      width: 260
    });
    this.groupCreatedOn = new qx.ui.form.TextField().set({
      width: 260
    });
    this.groupContact = new qx.ui.form.SelectBox();
    this.groupName = new qx.ui.form.TextField().set({
      width: 260
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
    }); // only creator, only subscribers, everyone
    this.groupVisible = new qx.ui.form.SelectBox().set({
      width: 200
    }); // only creator, only subscribers, everyone

    this.groupContribute.add(new qx.ui.form.ListItem("Only Group Creator"));
    this.groupContribute.add(new qx.ui.form.ListItem("Only Administrators"));
    this.groupContribute.add(new qx.ui.form.ListItem("Only Subscribers"));
    this.groupContribute.add(new qx.ui.form.ListItem("Everyone"));

    this.groupVisible.add(new qx.ui.form.ListItem("Only Group Creator"));
    this.groupVisible.add(new qx.ui.form.ListItem("Only Administrators"));
    this.groupVisible.add(new qx.ui.form.ListItem("Only Subscribers"));
    this.groupVisible.add(new qx.ui.form.ListItem("Everyone"));

    groupContainer3.add(new qx.ui.basic.Label().set({
      value: '<b>Rights & Permissions</b>',
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

    groupContainer.add(groupContainer1);
    groupContainer.add(groupContainer2);
    groupContainer.add(groupContainer3);

    container.add(groupContainer);

    this.add(container);

    this.userList.addListener('changeSelection',
      function(selectionEvent) {
        var username;
        
        if (selectionEvent && selectionEvent.getData()) {
          username = selectionEvent.getData()[0].getLabel();
          alert(username);
        }
      },
      this
    );

    this.groupList.addListener('changeSelection',
      function(selectionEvent) {
        var name;

        if (selectionEvent && selectionEvent.getData()) {
          name = selectionEvent.getData()[0].getLabel();
          alert(name);
        }
      },
      this
    );

    // Populate user-list:
    this.populateList(this.userList, 'get_userlist');

    // Populate group-list:
    this.populateList(this.groupList, 'get_grouplist');
  },

  members :
  {
    populateList : function(destination, request)
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
        { alphabetical: true },
        "true",
        []
      );
    }
  }
});