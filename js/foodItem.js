/*
foodItem.js by Ashwin Ramachandran

This file contains the class FoodItem. An instance of this object is the smallest unit/data/ tha gets passed
in the while Nutrition Track App.
It contains a data property (a FoodItemData object) and a view property (a FoodItemView object).
-> FoodItem is the wrapper that syncs the data object and view object together so they reflect the same state.
-> FoodItemData operates directly on the data of the FoodItem.
-> FoodItemView operates on the dom/html element of the FoodIitem.
*/

var FoodItem = function(foodName, brandName, cal, qty, servSize) {
	this.data = new FoodItemData(foodName, brandName, cal, qty, servSize);
	this.view = new FoodItemView(foodName, brandName, cal, qty, servSize);

	this.setLink();
};
// setLink will ensure when the element of the FoodItem is clicked, a property on the data
// object called userChose will reflect that.  What to do based on that is up to 
// whatever object implements FoodItem
FoodItem.prototype.setLink = function() {
	var self = this;
	this.view.el.on('click', function(e) {
		self.data.toggleUserChose();
	});
};
// resetUserChoice is for whatever decides to implement FoodItem.  If, after being clicked, the user
// wants to reset the clicked property back to its original state, they will use this method.
FoodItem.prototype.resetUserChoice = function() {
	this.data.toggleUserChose();
	this.view.toggleClickClass();
};	

// following bunch of methods are just data value getters
FoodItem.prototype.getName = function() {
	return this.data.name;
};
FoodItem.prototype.getBrand = function() {
	return this.data.brand;
};
FoodItem.prototype.getCalories = function() {
	return this.data.calories;
};
FoodItem.prototype.getQty = function() {
	return this.data.qty;
};
FoodItem.prototype.getServingUnit = function() {
	return this.data.servingSizeUnit;
};
FoodItem.prototype.getUserChose = function() {
	return this.data.userChose;
};

FoodItem.prototype.getViewEl = function() {
	return this.view.el;
};
/*
addQty and removeQty is for when the user of FoodItem (like a list that holds FoodItem objects for example)
finds they want to add a food that it already has.  Instead of having another entire FoodItem object that represents
the same thing, FoodItem enables you to update the quantity of the food accordingly.
*/
FoodItem.prototype.addQty = function() {
	this.data.addQty();
	this.view.modifyQty(this.data.qty, this.data.calories);
};
FoodItem.prototype.removeQty = function() {
	this.data.removeQty();
	this.view.modifyQty(this.data.qty, this.data.calories);
};
// if the user of FoodItem wants to check whether two FoodItem objects are equal, the following method is
// for that convenience. Since quantities and calories can change, check for equality on the rest of the
// properties.
FoodItem.prototype.sameFoodItem = function(foreignFoodItem) {
	var sameItemName = (this.getName() == foreignFoodItem.getName());
	var sameBrand = (this.getBrand() == foreignFoodItem.getBrand());
	var sameServingUnit = (this.getServingUnit() == foreignFoodItem.getServingUnit());

	return (sameItemName && sameBrand && sameServingUnit);
};

//----------------------------------------------------------------------------------


var FoodItemData = function(foodName, brandName, cal, qty, servSize) {
	this.name = foodName;
	this.brand = brandName;
	this.calories = cal;
	this.qty = qty;
	this.servingSizeUnit = servSize;
	this.userChose = false; // the 'I was clicked on' property
};


FoodItemData.prototype.toggleUserChose = function() {
	this.userChose = !(this.userChose);
};
/*
see FoodItem class' addQty/removeQty method explanations. 
The following two methods just operate on the data directly.
The FoodItem methods that you looked at previously just tell 
this object to do it.
*/
FoodItemData.prototype.addQty = function() {
	var originalCalories = this.calories / this.qty;
	this.qty = this.qty + 1;
	this.calories = originalCalories * this.qty;
};

FoodItemData.prototype.removeQty = function() {
	if(this.qty - 1 > 0) {
		var originalCalories = this.calories / this.qty;
		this.qty = this.qty - 1;
		this.calories = originalCalories * this.qty;
	}
};

//----------------------------------------------------------------------------------

/*
FoodItemView object operates on the html element directly. It is the physical representation of the
entire FoodItem object that the user interacts with.
*/
FoodItemView = function(foodName, brandName, cal, qty, servSize) {
	this.generateRepresentation(foodName, brandName, cal, qty, servSize);
};

FoodItemView.prototype.generateRepresentation = function(name, brand, calories, qty, servings) {
	var self = this;

	var listEl = $('<li></li>', {
		"class": "food-item",
		click: function(e) {
			self.toggleClickClass(); //class that toggles when the element is clicked
		}
	});

	var namePTag = $("<p>", {
		"class": "food-item-name",
	}).text('Name: ' + name);
	var brandPTag = $("<p>", {
		"class": "food-item-brand"
	}).text('Brand: ' + brand);

	var caloriesPTag = $("<p>", {
		"class": "food-item-calories",
		text: "Calories: "
	});
	// caloriesSpan is the element that get selected for FoodItem calories property updates
	var caloriesSpanTag = $("<span>", {
		"class": "food-item-numCal",
		text: calories
	}).appendTo(caloriesPTag);

	var servingsPTag = $('<p>', {
		"class": "food-item-servings"
	});
	// qtySpan is the element that get selected for FoodItem qty property updates
	var qtySpanTag = $('<span>', {
		"class": "food-item-qty",
		text: qty
	}).appendTo(servingsPTag);

	var servingSpanTag = $('<span>', {
		"class": "food-item-servingUnit",
		text: ' ' + servings
	}).appendTo(servingsPTag);


	listEl.append(namePTag);
	listEl.append(brandPTag);
	listEl.append(caloriesPTag);
	listEl.append(servingsPTag);

	this.el = listEl;

};

FoodItemView.prototype.toggleClickClass = function() {
	this.el.toggleClass("clicked-me");
};

FoodItemView.prototype.modifyQty = function(qty, cal) {
	this.el.find('.food-item-qty').text(qty);
	this.el.find('.food-item-numCal').text(cal);
};

/*FoodItemView.prototype.display = function(parentEl) {
	this.el.appendTo(parentEl);
};*/

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx