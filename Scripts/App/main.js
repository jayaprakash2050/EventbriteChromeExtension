"use strict";
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

//Event handler for Next weekend check box.
//This fetches all events that will happen on next weekend on selection of that checkbox,
$(document).on("change", "input[id='chknext-weekend']", function () {
	var place = autoComplete.getPlace();
	if( place != undefined && $("#location").val()) {
		populateEvents();
	}
});

//Event handler for distance dropdown.
//This fetches the events that will happen within the given distance from given location
$(document).on("change", "select[id='distance']", function () {
	var place = autoComplete.getPlace();
	if( place != undefined && $("#location").val()) {
		populateEvents();
	}
});

//Function to add geolocate() method as event listener for location textbox, for onFocus event
$(document).ready(function() {
	document.getElementById("location").addEventListener("onFocus", geolocate);
});

//This function calls the Eventbrite API to fetch the events based on the user selection. 
function populateEvents() {
	var place = autoComplete.getPlace();
	var latitude = place.geometry.location.lat();
	var longitude = place.geometry.location.lng();
	var spinner = '';
	//default distance to find events is 10 miles
	var distanceSelected = 10;	
	distanceSelected = $("#distance").val();
	var url = 'https://www.eventbriteapi.com/v3/events/search/?token=' + evenBriteToken + 
	'&location.latitude=' + encodeURIComponent(latitude) + 
	'&location.longitude=' + encodeURIComponent(longitude) + 
	'&location.within=' + encodeURIComponent(distanceSelected) + 'mi&popular=true';
	var nextSat, nextSun;
	/*If next weekend filter is selected then we calculate the next weekend dates and add it as 
	  condition for the Eventbrite API call.
	*/
	if ( $("#chknext-weekend").prop("checked") ) {
		nextSat = calculateNextWeekend();
		nextSun = new Date();
		nextSun.setDate(nextSat.getDate() + 1);
		nextSun.setHours(23,59,59, 999);
		nextSat = nextSat.toJSON();
		nextSat = nextSat.substring(0,nextSat.lastIndexOf('.'))+'Z';
		nextSun = nextSun.toJSON();
		nextSun = nextSun.substring(0,nextSun.lastIndexOf('.'))+'Z';
		url = url + '&start_date.range_start=' + encodeURIComponent(nextSat) + 
		'&start_date.range_end=' + encodeURIComponent(nextSun);
	}
	//Ajax call for Eventbrite API to fetch the events
	$.ajax( { 
		url: url,
		beforeSend: function(xhr) {
			var target = document.getElementById("content-div");
			spinner = new Spinner(opts);
			spinner.spin(target);
		},
		error: function(xhr) {
			spinner.stop();	
			$("#message-div").html("<h2>Some exception occured.</h2>");
			$("#event-container").empty();
		}
	})
		.done( function( data ) {
			//After recieving the data, read the data and populate the events template and 
			//display it in the pop up.
			spinner.stop();	
			var eventName, startDate, timeZone, logoURL, eventURL, listItemTemplate;
			var eventObjList = [];
			$("#message-div").empty();
			if (data.events.length < 1) {
				$("#message-div").html("<h2>No events found.</h2>");
				$("#event-container").empty();
			}
			else {
				$.each(data.events, function( key, event ){
					eventName = event.name.html;
					//Only 100 characters of event name will be displayes in the page.
					if (eventName.length > 100) {
						eventName = eventName.substr(0,100);
					}
					startDate = new Date(event.start.utc);
					timeZone = event.start.timezone;
					logoURL = '';
					if( event.logo ){
						logoURL = event.logo.url;
					}
					eventURL = event.url;
					startDate = formatDate(startDate);
					var eventObj = {
						eventurl: eventURL,
						imageurl: logoURL,
						eventtitle: eventName,
						date: startDate
					};
					eventObjList.push(eventObj);
				} );
				$("#event-container").loadTemplate("/Scripts/Templates/eventlist.html", eventObjList);
			}
		})
		.fail( function() {
			spinner.stop();	
			$("#message-div").html("<h2>Some exception occured.</h2>");
			$("#event-container").empty();
		});
}

