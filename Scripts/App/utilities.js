//This file contains the utility methods and methods needed for Google API
"use strict";
//Variable declarations
var placeSearch, autoComplete;
var eventBriteToken = "326SDDB4XLUPNNP3NJR4";
var daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var monthNames = 
["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//Options that are used for the spin progress indicator. Used by spin.min.js
var opts = {
  lines: 7 // The number of lines to draw
, length: 6 // The length of each line
, width: 7 // The line thickness
, radius: 9 // The radius of the inner circle
, scale: 1 // Scales overall size of the spinner
, corners: 1 // Corner roundness (0..1)
, color: '#000' // #rgb or #rrggbb or array of colors
, opacity: 0.1 // Opacity of the lines
, rotate: 8 // The rotation offset 	
, direction: 1 // 1: clockwise, -1: counterclockwise
, speed: 1 // Rounds per second
, trail: 50 // Afterglow percentage
, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
, zIndex: 2e9 // The z-index (defaults to 2000000000)
, className: 'spinner' // The CSS class to assign to the spinner
, top: '50%' // Top position relative to parent
, left: '50%' // Left position relative to parent
, shadow: false // Whether to render a shadow
, hwaccel: false // Whether to use hardware acceleration
, position: 'absolute' // Element positioning
};

//To format the date for displaying it in the page.
function formatDate( date ) {
	var d, day, timeHours, timeMinutes, month, am, result;
	d = date.getDate();
	day = date.getDay();
	timeHours = date.getHours();
	timeMinutes = date.getMinutes();
	timeMinutes = timeMinutes == '0' ? '00' : timeMinutes;
	month = monthNames[date.getMonth()];
	am = timeHours >= 12 ? 'PM' : 'AM';
	timeHours = timeHours > 12 ? timeHours-12 : timeHours;
	day = daysOfWeek[day];
	result = day + ', ' + month + ' ' + d + ' ' + timeHours + ':' + timeMinutes + ' ' + am;
	return result;  
}

//Function to calculate the next weekend based on the current date.
function calculateNextWeekend() {
	var date = new Date();
	date.setDate((date.getDate() + (7 + 6 - date.getDay()) % 7) + 7);
	date.setHours('00','00','00', '000');
	return date;
}



//Method to call google maps API to fetch the location suggestions for autocomplete.
//Uses the user's current location, if provided, to set the bounds
function geolocate() {

	if ( navigator.geolocation ) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var geolocation = {

				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			var circle = new google.maps.Circle({
				center: geolocation,
				radius: position.coords.accuracy
			});
			autoComplete.setBounds(circle.getBounds());
		});

	}
}

//This is the callback method for Google maps API
function initAutoComplete() {
	autoComplete = new google.maps.places.Autocomplete(
		(document.getElementById('location')),{types: ['geocode']});
	autoComplete.addListener('place_changed', populateEvents);
}