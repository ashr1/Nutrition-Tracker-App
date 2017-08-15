/* 
inputBar.js by Ashwin Ramachandran

This file contains the inputBar object.  It contains a data property (inpuBarData object) and a view 
property (inputBarView object).
Data object operates on the data.
View object operates on the dom/html element.
inputBar syncs the two (its property object) together.

Its responsibility in the app is to get the food item name that the user searches for and store it.
This component was designed with no assumptions in mind (generic).  The app object is what uses
this inputBar's generic functionality to make it more specific for this nutrition app.

App will use inputBar's value to fire off an AJAX request to the nutritionix API.

*/

//the inputBar class is like a wrapper that syncs the data and view object together to reflect the same state
var inputBar = function() {
	this.data = new inputBarData();
	this.view = new inputBarView();

	this.setExpectedBehavior();
};
// we expect that as the user types, the value of the inputBarData object will be the same
inputBar.prototype.setExpectedBehavior = function() {
	var self = this;
	//update the data object data value on a keyup event
	this.view.setBehavior('keyup', function() {
		var newVal = self.view.getVal();
		self.data.setFoodToSearch(newVal);
	});
};

inputBar.prototype.getFoodToSearch = function() {
	return this.data.getFoodToSearch();
};
/* 
setAdditionalBehavior is for whatever object uses this class. it is basically an event handler on the view element
but in an indirect fashion.  We do this so the parent object (app) can use its own context to
do what it wants with the value provided by this inputBar object.
*/
inputBar.prototype.setAdditionalBehavior = function(evt, handler) {
	this.view.setBehavior(evt, handler);
};

inputBar.prototype.setInitialVal = function(newVal) {
	this.data.setFoodToSearch(newVal);
	this.view.setInitialVal(newVal);
};

inputBar.prototype.display = function(parentEl) {
	this.view.display(parentEl);
};

//-------------------------------------------------------------------------------------------------------

var inputBarData = function() {
	this.foodToSearch = ''; // basically what the user typed
};

/*
Following two functions are data access
*/
inputBarData.prototype.getFoodToSearch = function() {
	return this.foodToSearch;
};

inputBarData.prototype.setFoodToSearch = function(newVal) {
	this.foodToSearch = newVal;
};

//---------------------------------------------------------------------------------------------------------

var inputBarView = function() {
	this.generateRepresentation();
};
// the view element is an input element
inputBarView.prototype.generateRepresentation = function() {
	var self = this;
	var el = $('<input>', {
		"class": 'input-bar'
	});

	this.el = el;
};

inputBarView.prototype.getVal = function() {
	return this.el.val();
};

inputBarView.prototype.setInitialVal = function(initVal) {
	this.el.val(initVal);
};
// see the setAdditionalBehavior (function of the wrapper class) explanation
inputBarView.prototype.setBehavior = function(evt, handler) {
	this.el.on(evt, handler);
};

inputBarView.prototype.display = function(parentEl) {
	this.el.appendTo(parentEl);
};

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Example of how to use this class on its own
/*var bar = new inputBar();
bar.setInitialVal("type something");
bar.display($('body'));*/