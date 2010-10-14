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

    var container = new qx.ui.container.Composite();
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
      value: 'User List',
      rich: true,
      appearance: 'annotation'
    }));
    this.userList = new qx.ui.form.List().set({
      width: 200
    });
    userContainer1.add(this.userList);

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
      value: 'Details',
      rich: true,
      appearance: 'annotation'
    }));
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

    this.userCreateUser = new qx.ui.form.CheckBox("Create User");
    this.userDeactivateUser = new qx.ui.form.CheckBox("Deactivate User");
    this.userCreateGroup = new qx.ui.form.CheckBox("Create Group");
    this.userUnsubscribe = new qx.ui.form.CheckBox("Unsubscribe");
    this.userDeleteGroup = new qx.ui.form.SelectBox(); // none, admin, all
    this.userPermissions = new qx.ui.form.SelectBox(); // none, created user, all
    this.userModify = new qx.ui.form.SelectBox(); // none, created user, all

    userContainer3.add(new qx.ui.basic.Label().set({
      value: 'Permissions',
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
      value: 'Delete Group'
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
      value: 'Group List',
      rich: true,
      appearance: 'annotation'
    }));
    this.groupList = new qx.ui.form.List().set({
      width: 200
    });
    groupContainer1.add(this.groupList);

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
      value: 'Details',
      rich: true,
      appearance: 'annotation'
    }));
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
      value: 'Group Name',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(this.groupName);
    groupContainer2.add(new qx.ui.basic.Label().set({
      value: 'Description',
      rich: true,
      appearance: 'annotation'
    }));
    groupContainer2.add(this.groupDescription);

    //this.groupContribute = new qx.ui.form.SelectBox(); // only creator, only subscribers, everyone
    //this.groupVisible = new qx.ui.form.SelectBox(); // only creator, only subscribers, everyone

    groupContainer.add(groupContainer1);
    groupContainer.add(groupContainer2);

    container.add(groupContainer);

    this.add(container);
  },

  members :
  {
  }
});