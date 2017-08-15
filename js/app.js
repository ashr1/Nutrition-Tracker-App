/* 
app.js by Ashwin Ramachandran

This file contains the app object.  It basically syncs the various components together to perform the task
of tracking user's total calories.  It is the most dependent of all the objects/components in the app since it is also
the 'big picture' object.

App is comprised of its data object and view object.
The App object syncs the data and view to reflect the same state.
The data object operates on the data. The view object operates on the view/html element directly.

-> Its data object holds the inputBar object, the results list object and the user list object. They
are in separate files with their own explanations/structure, so definitely take a look at them for the details.
They are the 'components' of this entire app, having their own functions.  They are merely being used and orchestrated
by this app object.
-> Its view object is its own visual/html element respresentation the users can see.

*/

var App = function() {

	this.data = new AppData();
	this.view = new AppView();

	/* 
	setUpComponentBehaviors:
	set up the components (search bar + lists which are classes on their own) within the context of this
	nutrition tracker app object.  The components were made to be functional on their own, so this step is
	necessary here.
	*/
	this.setUpComponentBehaviors();
	this.display(); //once everything is set up, we are ready to ship it to the screen
};


App.prototype.setUpComponentBehaviors = function() {
	this.setUpSearchBar();
	this.setUpResultsList();
	this.setUpUserList();
};

App.prototype.setUpSearchBar = function() {
	var self = this;

	var searchBar = self.data.getSearchBar(); //get the object from asking the Appdata object

	searchBar.setInitialVal('Enter a food name');
	/*
	setup the timing of events: on keyup the input bar component should have what the user typed as data
	so get that value and fire off the request to the nutrition app.  The request is part of this app object
	not the inputbar (hence the proper context as described before)
	*/
	searchBar.setAdditionalBehavior('keyup', function() {
		var inputValue = (self.data.getSearchBar()).getFoodToSearch();
		self.fireAjaxRequest(inputValue);
	});

	searchBar.display(self.view.getViewEl());
};

App.prototype.setUpResultsList = function() {
	var self = this;

	var resultsList = this.data.getResultsList();
	// the ResultsList has a setLink method available for context. When an item is clicked on that list
	// the behavior can be setup here
	resultsList.setLink(function() {
		var clickedFood = resultsList.retrieveClickedItem();
		// when item on results list (foods displayed from the request) is clicked add it to the
		// users list...the user selected the item because they had that food
		self.addItemToUserList(clickedFood);
	});
	// this component is set up fully in the right context so we can add its view element to this app's view element
	this.view.addComponents(resultsList.getViewEl());
};

App.prototype.setUpUserList = function() {
	// user list is simple to set up because it is pretty much a generic/work as you'd expect list
	// click an item to remove
	var userList = this.data.getUserList();
	userList.display(this.view.getViewEl());
};

// fireAjaxRequest sends the request (for food the user wants a match for) to nutritionix
// information for 0-20 possible matching foods will arrive
App.prototype.fireAjaxRequest = function(foodItem) {
	var self = this;

	var askForFoods = $.ajax({
		url: "https://api.nutritionix.com/v1_1/search/" + foodItem,
		data: {
			results: "0:20",
			cal_min: 0,
			cal_max: 50000,
			fields: "item_name,item_id,brand_name,nf_calories",
			appId: '63c8148d',
			appKey: '4bd37c6ac53ea40567344784bbc9b00b'
		},
		success: function(data) {
			// when data has arrived parse it to be usable by the FoodItem/FoodList classes
			self.parseRequestData(data.hits);
		},
		error: function() {
			// in case of error alert user
			console.log("an error occurred");
		}
	});
};

// grab the relevant items from the response 
App.prototype.parseRequestData = function(dataArr) {
	
	var itemName, brandName, calories, qty;
	var self = this;

	self.clearResultsList();
	// loop through each of the foods from the response
	dataArr.forEach(function(element) {

		itemName = element.fields.item_name;
		brandName = element.fields.brand_name;
		calories = element.fields.nf_calories;
		qty = parseInt(element.fields.nf_serving_size_qty);
		servingUnit = element.fields.nf_serving_size_unit;

		// we would like to add the food to the results list
		self.resultToResultsList(itemName, brandName, calories, qty, servingUnit);
	});
};

App.prototype.clearResultsList = function() {
	//clear the list with each new request/response (each containing 0-20 foods as described in the fireAjaxRequest function)
	(this.data.getResultsList()).emptyList();
};

App.prototype.resultToResultsList = function(itemName, brandName, calories, qty, servingUnit) {
	// give the information to the ResultsList object via its addFoodItem method and let it take care of the rest (data and display)
	(this.data.getResultsList()).addFoodItem(itemName, brandName, calories, qty, servingUnit);
};

// when an item on the results list is clicked, the foodItem gets added to the user list
// this relationship was defined in the setLink portion of the setUpResults function above
App.prototype.addItemToUserList = function(foodItem) {
	var userList = this.data.getUserList();

	var foodName = foodItem.getName();
	var foodBrand = foodItem.getBrand();
	var foodCalories = foodItem.getCalories();
	var foodQty = foodItem.getQty();
	var foodServeSize = foodItem.getServingUnit();

	//give the food information to the userlist and let it take care of the rest (data and display)
	userList.addFoodItem(foodName, foodBrand, foodCalories, foodQty, foodServeSize);
};

App.prototype.display = function() {
	this.view.display();
};

//--------------------------------------------------------------------------------------
// contains the raw componentes of this app
// as described in the heading comment of this file, each are in separate files.  They
// were designed to be functional on their own 
var AppData = function() {
	this.searchBar = new inputBar();
	this.results = new ResultsFoodList();
	this.userList = new UserFoodList();
};

// the getter methods. we can give the object references because these components have
// setter methods (via their design) of their own. so used like this, the data modifications
// go through the wrapper parent (think what app is to app data), which call the
// data object methods to make the modifications on its own.
AppData.prototype.getSearchBar = function() {
	return this.searchBar;
};

AppData.prototype.getResultsList = function() {
	return this.results;
};

AppData.prototype.getUserList = function() {
	return this.userList;
};

//--------------------------------------------------------------------------------------
// the view for the entire app, the main property is el which is the reference to the 
// html element (a div) that is the visual representation of the app object that
// holds all the components together
var AppView = function() {
	this.generateRepresentation();
};

AppView.prototype.generateRepresentation = function() {
	var el = $('<div>', {
		"class": 'app'
	});

	this.el = el;
};

AppView.prototype.getViewEl = function() {
	return this.el;
};

AppView.prototype.display = function(parentEl) {
	this.el.appendTo($('body'));
};
// add a component view (search bar view, one of the list views, etc.). App view is the base view element.
AppView.prototype.addComponents = function(component) {
	this.el.append(component);
};

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

var app = new App();