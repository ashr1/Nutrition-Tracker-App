/* 
foodList.js by Ashwin Ramachandran

This file contains the FoodList object, UserList object and the ResultsList object.
These objects hold items of the class FoodItem.  They each have their own data object and view
object as their properties.  Data object operates on the data and the view object operates
on the dom.  The wrapper object (foodList, UserList, ResultsList) syncs the data and view together.

-> The Foodlist  object was designed as a generic list (albeit with the FoodItem class in mind).  
What you'd expect from a list.
You can add to it, remove from it by clicking on its list element.
This object is the super class (parent) of the UserList and ResultsList object.
Userlist and ResultsList are its subclasses that show up in the app.

-> UserList (subclass) differs from FoodList (its parent) in that it has a totalCalories
property.  Functionally it is similar to its parent.

-> ResultsList just displays the food information (as FoodItem objects) that the App object gives
it as a result of the AJAX request to the nutrition site.  When an item is clicked on,
it gets duplicated and then added to the UserList.  No removal of foodItems from this list because users may
want to add the same foodItem to their list (multiple servings).

*/

var FoodList = function() {
	this.data = new FoodListData();
	this.view = new FoodListView();

	this.setLink();
};

FoodList.prototype.addFoodItem = function(foodName, brandName, cal, qty, servSize) {
	// create a foodItem object out of the necesary parameters
	var food = new FoodItem(foodName, brandName, cal, qty, servSize);
	// as long as it is a new FoodItem (not an addition of qty to a preexisting food), update the list view with the new element
	// a qty addition/removal view/data update is taken care of by the foodItem class itself, so no need to update view in that case
	var viewAlreadyModified = this.data.addFoodItem(food);
	if(!(viewAlreadyModified)) {
		console.log(viewAlreadyModified);
		this.view.addFoodItem(food.getViewEl());
	}
};


FoodList.prototype.setLink = function() {
	var self = this;
	// if a click happens on the list element (this object view) call the method
	this.view.el.on('click', function() {
		
		self.clickToRemoveRelationship();
		
	});

};

/*
clickToRemoveRelationship calls the remove food method of the list. If there are more than one
occurence of the same food (indicated by the qty property of the foodItem object), then just remove
one of the quantity...not the entire food object and its view from the list.  
If qty was subtracted foodItem updates its own view by itself...the list doesn't have to remove the
element entirely.
*/
FoodList.prototype.clickToRemoveRelationship = function() {

		var resultOfRemoval = this.data.removeFoodItem();
		if(resultOfRemoval.removedTheElement) {
			this.view.removeFoodItem(resultOfRemoval.item.getViewEl());
		} 
		else {
			resultOfRemoval.item.resetUserChoice();
		}
};
// makes no assumptions about its parent element.  The parent element tells it where to go.
FoodList.prototype.display = function(parentEl) {
	this.view.display(parentEl);
};


//------------------------------------------------------------------------------------------

//this object operates on the foodList data directly
var FoodListData = function() {
	this.data = []; // array that holds the foodItem objects together
};

FoodListData.prototype.addFoodItem = function(foodItemToAdd) {
	var currentFoodItem, index;
	var found = null;
	for(index = 0; index < this.data.length; index++) {
		currentFoodItem = this.data[index];
		/* 
		if the foodItem, the user wants to add, is already in the list...just update the quantity
		property of the foodItem (by calling the foodItem's method...not modifying the data directly).
		No need to add the same foodItem object...since the foodItem object was designed with duplicates
		in mind.
		*/
		if(currentFoodItem.sameFoodItem(foodItemToAdd)) {
			currentFoodItem.addQty();
			found = true;
			break;
		}

	}
	if(index == this.data.length) {
		this.data.push(foodItemToAdd);
		found = false;
	}
	return found;
};

/*
Same idea as the addFoodItem method.  Remove a foodItem from the list. If the same food has multiple
quantity, remove one from that property.  If removal is called on a foodItem whose quantity is
one...then remove the entire food object from the list.
*/
FoodListData.prototype.removeFoodItem = function() {
	var currentFoodItem, index;
	var removedFoodItem = null;
	var needToDelete = null;
	var returnResult = {};
	
	for(index = 0; index < this.data.length; index++) {
		currentFoodItem = this.data[index];
		if(currentFoodItem.getUserChose()) {
			if(currentFoodItem.getQty() == 1) {
				needToDelete = true;
			}
			else {
				currentFoodItem.removeQty();
				removedFoodItem = currentFoodItem;
				needToDelete = false;
			}
			break;
		}
	}

	if(needToDelete) {
		removedFoodItem = (this.data.splice(index, 1))[0];
	}

	returnResult.item = removedFoodItem;
	returnResult.removedTheElement = needToDelete;

	return returnResult;
};

//------------------------------------------------------------------

// modifications to the dom are done directly in the FoodListView object.
var FoodListView = function() {
	this.generateRepresentation();
};

/*
generateRepresentation will create the view element for the entire FoodItem object. Conceptually
it is an unordered list, but for later specifity it is a div element that contains a header element 
(name of list) and the unordered list itself. 
*/
FoodListView.prototype.generateRepresentation = function() {
	var self = this;

	var container = $('<div>', {
		"class": "list-view-container"
	});
	var header = $('<h2>', {
		"class": "name-of-list",
		text: 'Food List'
	});
	var listEl = $('<ul>', {
		"class": 'food-list',
		click: function(e) {
			console.log(e);
		}
	});

	header.appendTo(container);
	listEl.appendTo(container);

	self.el = container;
};

// list view updates with new item that the user can see
FoodListView.prototype.addFoodItem = function(foodEl) {
	this.el.find('.food-list').append(foodEl);
};
// same concept as add
FoodListView.prototype.removeFoodItem = function(foodItemToRemove) {
	foodItemToRemove.remove();
};

FoodListView.prototype.display = function(parentEl) {
	this.el.appendTo(parentEl);
};

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// how to use this class on its own:
/*var list = new FoodList();
list.view.display();*/

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

/* 
UserFoodList is a subclass of FoodList.  The only noticeable difference being that UserFoodList
has a totalCalories property (its data object does) that shows the total calories of all the 
foodItems in the list.
*/
var UserFoodList = function() {
	this.data = new UserFoodListData();
	this.view = new UserFoodListView();
	this.setLink();
};

UserFoodList.prototype = Object.create(FoodList.prototype);
UserFoodList.prototype.constructor = UserFoodList;

UserFoodList.prototype.addFoodItem = function(foodName, brandName, cal, qty, servSize) {
	// call the superclass (FoodList) add method..since it is the same conceptually here
	Object.getPrototypeOf(UserFoodList.prototype).addFoodItem.call(this, foodName, brandName, cal, qty, servSize);
	// account for the new totalCalories property
	this.view.updateCalories(this.data.totalCalories);
};

UserFoodList.prototype.clickToRemoveRelationship = function() {
	Object.getPrototypeOf(UserFoodList.prototype).clickToRemoveRelationship.call(this);
	this.view.updateCalories(this.data.totalCalories);
};

UserFoodList.prototype.display = function(parentEl) {
	this.view.display(parentEl);
};

//----------------------------------------------------------------------------------------

var UserFoodListData = function() {
	FoodListData.call(this);
	this.totalCalories = 0; //this is the total calories of all the foods in the list.
							// it is the major difference from the superclass 
};

UserFoodListData.prototype = Object.create(FoodListData.prototype);
UserFoodListData.prototype.constructor = UserFoodListData;


UserFoodListData.prototype.updateTotalCalories = function() {
	var totalCals = 0;

	for(var index = 0; index < this.data.length; index++) {
		var currentFoodItem = this.data[index];
		totalCals = totalCals + currentFoodItem.getCalories();
	}

	this.totalCalories = totalCals;
};

/*
Add and remove methods are the same as the FoodList parent class, so no need to rewrite the code. 
Just make sure to account for the new totalCalories property here.
*/

UserFoodListData.prototype.addFoodItem = function(foodItemToAdd) {
	var viewAlreadyModified = Object.getPrototypeOf(UserFoodListData.prototype).addFoodItem.call(this, foodItemToAdd);
	this.updateTotalCalories();

	return viewAlreadyModified;
};

UserFoodListData.prototype.removeFoodItem = function() {
	var resultOfRemoval = Object.getPrototypeOf(UserFoodListData.prototype).removeFoodItem.call(this);
	this.updateTotalCalories();

	return resultOfRemoval;
};

//-------------------------------------------------------------------------------------------

var UserFoodListView = function() {
	this.generateRepresentation();
};

UserFoodListView.prototype = Object.create(FoodListView.prototype);
UserFoodListView.prototype.constructor = UserFoodListView;

// since the element is the same as the superclass, just call the super method
// just make sure to update the header title other specifities to make the element
// reflect that its a user food list
UserFoodListView.prototype.generateRepresentation = function() {

	Object.getPrototypeOf(UserFoodListView.prototype).generateRepresentation.call(this);
	this.el.find(".name-of-list").text("User Foods List");
	this.el.find(".food-list").addClass("user");

	var caloriesPTag = $('<p>', {
		"class": "user-calories",
		text: 'Total Calories: '
	});
	var caloriesSpanTag = $('<span>', {
		"class": 'total-calories',
		text: '0'
	});

	caloriesSpanTag.appendTo(caloriesPTag);
	caloriesPTag.appendTo(this.el);

};

UserFoodListView.prototype.updateCalories = function(totalCalories) {
	this.el.find('.total-calories').text(totalCalories);
};

UserFoodListView.prototype.addFoodItem = function(foodEl) {
	console.log(foodEl);
	this.el.find('.food-list.user').append(foodEl);
};

UserFoodListView.prototype.display = function(parentEl) {
	this.el.appendTo(parentEl);
};

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// How to use this class on its own:
/*var list = new UserFoodList();
list.view.display();*/

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

/*
ResultsFoodsList is a subclass of FoodList.  It stores the food information from app object as FoodItem objects.
The difference from its parent class being removal here doesn't mean removing the food
from this list, but just giving the info back to the app object for it to be added to the user list.
What if the user wants to add one more serving of the same food?  That is why the removal is the way it is here.
*/
var ResultsFoodList = function() {
	this.data = new ResultsFoodListData();
	this.view = new ResultsFoodListView();

	//this.setLink() will not be called here unlike the super class because the app object needs to
	// have access to the timing (click) provided by this method
};

ResultsFoodList.prototype = Object.create(FoodList.prototype);
ResultsFoodList.prototype.constructor = ResultsFoodList;

ResultsFoodList.prototype.addFoodItem = function(foodName, brandName, cal, qty, servSize) {
	var food = new FoodItem(foodName, brandName, cal, qty, servSize);
	this.data.addFoodItem(food);
	this.view.addFoodItem(food.getViewEl());
};
//each request will have a bunch of foods, so remove the previous request FoodItems entirely
// for a fresh start.  This method will be call by the big picture app pbject.
ResultsFoodList.prototype.emptyList = function() {
	this.data.emptyList();
	this.view.emptyList();
};

ResultsFoodList.prototype.setLink = function(handler) {
	var self = this;
	this.view.el.on('click', handler);
};

ResultsFoodList.prototype.retrieveClickedItem = function() {
	var clickedFoodItem = this.data.retrieveClickedItem();
	clickedFoodItem.resetUserChoice();

	return clickedFoodItem;
};

ResultsFoodList.prototype.getViewEl = function() {
	return this.view.getViewEl();
};

//---------------------------------------------------------------------------------------------------

var ResultsFoodListData = function() {
	FoodListData.call(this);
};

ResultsFoodListData.prototype = Object.create(FoodListData.prototype);
ResultsFoodListData.prototype.constructor = ResultsFoodListData;

ResultsFoodListData.prototype.addFoodItem = function(foodItemToAdd) {
	// no need to check for duplicate foods because the results from the api don't give unique foods
	this.data.push(foodItemToAdd);
};

ResultsFoodListData.prototype.emptyList = function() {
	this.data = [];
};

ResultsFoodListData.prototype.retrieveClickedItem = function() {
	// use the 'was clicked' property of the FoodItem objects (called userChose) to find which one was clicked
	var clickedFoodItem = this.data.filter(function(foodItem) {
		return foodItem.getUserChose(); //ask the foodItem object, not access it directly
	});

	return clickedFoodItem[0];
};

//---------------------------------------------------------------------------------------------------

var ResultsFoodListView = function() {
	FoodListView.call(this);
};

ResultsFoodListView.prototype = Object.create(FoodListView.prototype);
ResultsFoodListView.prototype.constructor = ResultsFoodListView;
// just adding specifics to the values of the parent to make it applicable to the Results list object
ResultsFoodListView.prototype.generateRepresentation = function() {

	Object.getPrototypeOf(ResultsFoodListView.prototype).generateRepresentation.call(this);
	this.el.find(".name-of-list").text("Results Foods List");
	this.el.find(".food-list").addClass("results");

};

ResultsFoodListView.prototype.getViewEl = function() {
	return this.el;
};

ResultsFoodListView.prototype.addFoodItem = function(foodItemEl) {
	this.el.find('.food-list.results').append(foodItemEl);
};

ResultsFoodListView.prototype.emptyList = function() {
	this.el.find('.food-list.results').empty();
};

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Example of using this class on its own:
/*var list = new ResultsFoodList();
(list.getViewEl()).appendTo($('body'));*/
//console.log(list.getViewEl());
