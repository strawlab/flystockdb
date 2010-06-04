/* ************************************************************************

   Copyright and License: see LICENSE file

   Contributors:
     * Joachim Baran

************************************************************************ */

/* ************************************************************************

#asset(fly/test.png)

************************************************************************ */


/**
 * This is the main class of contribution "fly"
 */
qx.Class.define("gazebo.fly.Contribution",
{
  extend : qx.core.Object,
  implement : [ gazebo.IDelegator ],

  construct : function() 
  {
    this.inquirer = null;

    this.requestTransition = false;
  },

  members:
  {
    registerContributionName : function()
    {
      return "Fly Stock";
    },

    registerInitialScreen : function(inquirer)
    {
      this.inquirer = inquirer;

      inquirer.openScreen(inquirer.generateBasket, inquirer,
        {
          title: 'Genotype',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 20,
          populate: 6,
          titles: [ 'Chromosome X',
                    'Chromosome Y',
                    'Chromosome 2',
                    'Chromosome 3',
                    'Chromosome 4',
                    'Unknown'
                  ]
        }, {});
        
      inquirer.openScreen(inquirer.generateSearchDialog, inquirer,
        {
          title: 'Add...',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 200
        },
        {
          onKeyPress: { call: this.keyListener, context: this },
          onInput: { call: this.inputListener, context: this }
        });

      inquirer.openScreen(inquirer.generateLogo, inquirer, {}, {});
    },

    registerNextScreen : function(inquirer)
    {
      inquirer.closeScreen(inquirer.disposeSearchDialog, inquirer, {});

      inquirer.openScreen(inquirer.generateSearchDialog, inquirer,
        {
          title: 'Add...',
          left: inquirer.LEFT_SO_THAT_CENTERED,
          top: 200
        },
        {
          onInput: { call: this.inputListener, context: this }
        });
    },

    inputListener : function(dataEvent)
    {
      var userInput = dataEvent.getData();

      if (userInput.length > 0 && userInput.indexOf(' ') >= 0) {
      //if (userInput.length > 0 && userInput.charAt(userInput.length - 1) == ' ') {
        this.requestTransition = false;

        userInput = userInput.replace(/^\s+|\s+$/g,"");
        // Random number: 0..5
        this.inquirer.setBasketItem(Math.floor(Math.random() * 6), new qx.ui.basic.Label(userInput));
        
        this.inquirer.suggestScreenTransition();
      }
    }
  }
});
