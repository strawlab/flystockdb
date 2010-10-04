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

    this.setLayout(new qx.ui.layout.HBox(10));

    this.setMinWidth(800);

    this.container = new qx.ui.container.Composite();
    this.container.setLayout(new qx.ui.layout.VBox(10));
    
    idContainer = new qx.ui.container.Composite();
    idContainer.setLayout(new qx.ui.layout.HBox(10));

    idContainer1 = new qx.ui.container.Composite();
    idContainer1.setLayout(new qx.ui.layout.VBox(10));

    idContainer2 = new qx.ui.container.Composite();
    idContainer2.setLayout(new qx.ui.layout.VBox(10));

    idContainer3 = new qx.ui.container.Composite();
    idContainer3.setLayout(new qx.ui.layout.VBox(10));

    idContainer4 = new qx.ui.container.Composite();
    idContainer4.setLayout(new qx.ui.layout.VBox(10));

    idContainer1.add(new qx.ui.basic.Label().set({
      value: 'Internal Stock-ID',
      rich: true,
      appearance: 'annotation'
    }));
    idContainer1.add(new qx.ui.form.TextField().set({
      width: 200
    }));

    idContainer2.add(new qx.ui.basic.Label().set({
      value: 'External Stock-ID',
      rich: true,
      appearance: 'annotation'
    }));
    idContainer2.add(new qx.ui.form.TextField().set({
      width: 200
    }));

    var separator = new qx.ui.menu.Separator();
    separator.setDecorator('separator-horizontal');
    separator.setWidth(3);
    separator.setHeight(45);
    idContainer3.add(separator);

    idContainer4.add(new qx.ui.basic.Label().set({
      value: 'Created By',
      rich: true,
      appearance: 'annotation'
    }));
    idContainer4.add(new qx.ui.form.TextField().set({
      readOnly: true,
      width: 200
    }));

    idContainer.add(idContainer1);
    idContainer.add(idContainer2);
    idContainer.add(new qx.ui.core.Spacer(65));
    idContainer.add(idContainer3);
    idContainer.add(new qx.ui.core.Spacer(42));
    idContainer.add(idContainer4);

    this.container.add(idContainer);

    this.container.add(new qx.ui.basic.Label().set({
      value: 'Descriptions, Annotations and Notes',
      rich: true,
      appearance: 'annotation'
    }));

    this.container.add(new qx.ui.form.TextArea().set({
      maxLength: 65535,
      height: 200
    }));

    this.container.add(new qx.ui.core.Spacer(10,20));

    this.container.add(new qx.ui.basic.Label().set({
      value: 'Group Membership',
      rich: true,
      appearance: 'window/title',
      textColor: 'text-gray'
    }));

    var groupSeparator = new qx.ui.menu.Separator();
    groupSeparator.setDecorator('separator-vertical');
    this.container.add(groupSeparator);

    groupContainer = new qx.ui.container.Composite();
    groupContainer.setLayout(new qx.ui.layout.HBox(10));

    groupContainer1 = new qx.ui.container.Composite();
    groupContainer1.setLayout(new qx.ui.layout.VBox(10));

    groupContainer2 = new qx.ui.container.Composite();
    groupContainer2.setLayout(new qx.ui.layout.VBox(10));

    groupContainer3 = new qx.ui.container.Composite();
    groupContainer3.setLayout(new qx.ui.layout.VBox(10));

    var availableGroups = new qx.ui.form.List();
    availableGroups.setWidth(350);
    availableGroups.setHeight(180);

    availableGroups.setSelectionMode("multi");

    availableGroups.add(new qx.ui.basic.Atom("A. Aaronson Group, University of Aaberg"));
    availableGroups.add(new qx.ui.basic.Atom("B.B. Bronson Group, University of Bern"));
    availableGroups.add(new qx.ui.basic.Atom("C. Charles Group, CERN"));

    groupContainer1.add(new qx.ui.basic.Label().set({
      value: 'Available Groups',
      appearance: 'annotation'
    }));
    groupContainer1.add(availableGroups);

    groupContainer2.add(new qx.ui.core.Spacer(10,80));
    groupContainer2.add(new qx.ui.form.Button(null, 'qx/icon/Oxygen/22/actions/go-next.png'));
    groupContainer2.add(new qx.ui.form.Button(null, 'qx/icon/Oxygen/22/actions/go-previous.png'));

    var assignedGroups = new qx.ui.form.List();
    assignedGroups.setWidth(350);
    assignedGroups.setHeight(180);

    assignedGroups.setSelectionMode("multi");

    assignedGroups.add(new qx.ui.basic.Atom("Publicly-Visible Stocks"));

    groupContainer3.add(new qx.ui.basic.Label().set({
      value: 'Assigned Groups',
      appearance: 'annotation'
    }));
    groupContainer3.add(assignedGroups);

    groupContainer.add(groupContainer1);
    groupContainer.add(groupContainer2);
    groupContainer.add(groupContainer3);

    this.container.add(groupContainer);

    this.add(this.container);

    var mainSeparator = new qx.ui.menu.Separator();
    mainSeparator.setDecorator('separator-horizontal');
    mainSeparator.setWidth(3);
    this.add(mainSeparator);

    this.add(new qx.ui.form.Button(null, 'qx/icon/Oxygen/64/actions/dialog-ok.png'));
  },

  members:
  {

  }
});