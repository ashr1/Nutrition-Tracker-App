
## Nutrition Tracker App
User search for a food, the app fires of a request to the Nutritionix API and returns with possible matches.
The user selects the matching food and it displays on their list.  Total calorie count of all the foods is kept track of.
If the user adds the same food twice the quantity of the matching food in the user list updates.  The quantity aspect
was made simple by writing with structure in mind.

My goal with this project was to teach myself how to write well structured code, without the use of frameworks.
Each component of the app has its own structure associated with it. My suggestion, if you were to inspect it, is to go from the
smallest component to the largest in this order:

inputBar.js -> foodItem.js -> foodList.js -> app.js.  

This app does not contain data persistance.  I learnt localStorage in working on another "self-administered" project titled Quote-Keeper.  Its repository is also available. 

### Getting started

Download a zip and open up index.html in a browser to start up the app. 

### Credits

As always, jQuery.
Nutritionix API was used for the food information.

### Thanks!