/*
   Copyright and License: see LICENSE file

   Contributors:
	   * Joachim Baran
 */

/**
 * A container that holds multiple shopping baskets.
 */
qx.Class.define("gazebo.ui.BasketContainer",
{
  extend : qx.ui.container.Composite,

  statics :
  {
    EMPTY_BASKET_ITEM: 0,
    STICKY_BASKET_ITEM: 1,
    LIBERAL_BASKET_ITEM: 2
  },

  construct : function(parameters, listeners, overrides)
  {
    this.base(arguments);

    var populate = parameters['populate'];
    var titles = parameters['titles'];

    this.labels = parameters['labels'];

    // Install overrides (needed when populating baskets):
    if (overrides['makeEmptyBasketLabel']) {
      this.makeEmptyBasketLabel = overrides['makeEmptyBasketLabel'];
    }

    this.setLayout(new qx.ui.layout.Flow(5, 5));
    this.setAllowStretchX(false, false);
    this.setWidth(850);

    if (populate) {
      for (var i = 0; i < populate; i++) {
        var basketTitle = titles && titles.length > i ? titles[i] : null;

        this.addBasket(basketTitle);
      }
      for (i = 0; i < populate; i++) {
        var emptyBasketLabel = this.makeEmptyBasketLabel(i);

        if (emptyBasketLabel) {
          this.addFlavouredBasketItem(i, emptyBasketLabel, gazebo.ui.BasketContainer.EMPTY_BASKET_ITEM);
        }
      }
    }
  },

  members:
  {
    addBasket : function(title)
    {
      var itemContainer = new qx.ui.groupbox.GroupBox();

      if (title) {
        itemContainer.setLegend(title);
      }

      itemContainer.setLayout(new qx.ui.layout.VBox(5));
      itemContainer.setMinWidth(130);
      itemContainer.setMinHeight(200);

      this.add(itemContainer, { flex: 0 });
    },

    getBasketItem : function(index)
    {
      var baskets = this.getChildren();

      return baskets[index].getChildren();
    },

    setBasketItem : function(index, item)
    {
      var baskets = this.getChildren();
      var itemContainer = baskets[index];

      itemContainer.removeAll();
      this.addBasketItem(index, item);
    },

    addBasketItem : function(index, item)
    {
      this.addFlavouredBasketItem(index, item, gazebo.ui.BasketContainer.LIBERAL_BASKET_ITEM);
    },

    addFlavouredBasketItem : function(index, item, flavor)
    {
      var baskets = this.getChildren();
      var itemContainer = baskets[index];

      var contents = itemContainer.getChildren();

      if (contents &&
          contents.length == 1 &&
          contents[0].itemFlavor == gazebo.ui.BasketContainer.EMPTY_BASKET_ITEM) {
        itemContainer.remove(contents[0]);
      }

      this.debug("flavour: " + flavor);
      this.debug("itemContainer: " + itemContainer);
      
      var itemComposite = new qx.ui.container.Composite();
      itemComposite.itemFlavor = flavor;
      itemComposite.setLayout(new qx.ui.layout.HBox(5));

      var that = this;
      var controlButton = null; 
      if (flavor != gazebo.ui.BasketContainer.EMPTY_BASKET_ITEM) {
        controlButton = new qx.ui.basic.Atom(null, "qx/icon/Oxygen/16/actions/help-about.png");
      }
      if (controlButton) {
        controlButton.addListener('click', function(mouseEvent) {
          var popup = new qx.ui.popup.Popup(new qx.ui.layout.VBox(5)).set({
            backgroundColor: "#EEEEEE",
            padding: [2, 4],
            offset : 3,
            offsetBottom : 20
          });

          if (flavor != gazebo.ui.BasketContainer.STICKY_BASKET_ITEM) {
            for (var i = 0; i < baskets.length; i++) {
              if (i != index) {
                var icon = that.getDirectionIcon(index, i);
                var moveTo;

                if (that.labels) {
                  moveTo = new qx.ui.basic.Atom("Move to " + that.labels[i], icon);
                } else {
                  moveTo = new qx.ui.basic.Atom("Move to " + baskets[i].getLegend(), icon);
                }
                moveTo.destinationIndex = i;

                moveTo.addListener('click', function() {
                  that.removeBasketItem(index, itemComposite);
                  that.addBasketItem(this.destinationIndex, item);
                  popup.hide();
                  popup.dispose();
                }, moveTo)

                popup.add(moveTo);
              }
            }
          }

          var remove = new qx.ui.basic.Atom("Remove", 'qx/icon/Oxygen/16/actions/edit-delete.png');

          remove.addListener('click', function () {
            that.removeBasketItem(index, itemComposite);
            popup.hide();
            popup.dispose();
          }, that);

          popup.add(remove);
          popup.placeToMouse(mouseEvent);
          popup.show();
        });
        
        itemComposite.add(controlButton, { flex: 0 });
      }

      itemComposite.add(item, { flex: 1 });

      itemContainer.add(itemComposite, 1);
    },

    removeBasketItem : function(index, item)
    {
      var baskets = this.getChildren();
      var itemContainer = baskets[index];

      itemContainer.remove(item);

      var contents = itemContainer.getChildren();
      this.debug('removeBasketItem: ' + contents);
      if (!contents || contents.length == 0) {
       var emptyBasketLabel = this.makeEmptyBasketLabel(index);

        if (emptyBasketLabel) {
          this.addFlavouredBasketItem(index, emptyBasketLabel, gazebo.ui.BasketContainer.EMPTY_BASKET_ITEM);
        }
      }
    },

    getDirectionIcon : function(position, destination) {
      if (position > destination) {
        return 'qx/icon/Oxygen/16/actions/go-previous.png';
      } else {
        return 'qx/icon/Oxygen/16/actions/go-next.png';
      }
    },

    makeEmptyBasketLabel : function(index) {
      return null;
    }
  }
});