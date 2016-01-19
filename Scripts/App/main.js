"use strict";
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

	var urlParam = {
		token: eventBriteToken,
		'location.latitude': latitude,
		'location.longitude':longitude,
		'location.within': distanceSelected+'mi',
		popular: 'true'
	};

	var url = 'https://www.eventbriteapi.com/v3/events/search/?' + $.param(urlParam);
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
		var urlParams = {
			token: eventBriteToken,
			'location.latitude': latitude,
			'location.longitude':longitude,
			'location.within': distanceSelected+'mi',
			'start_date.range_start': nextSat,
			'start_date.range_end': nextSun
		};
 		url = 'https://www.eventbriteapi.com/v3/events/search/?' + $.param(urlParams);
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
			$("div#message-div h2").html("Network Error.");
			$("#event-container").empty();
		}
	})
		.done( function( data ) {
			//After recieving the data, read the data and populate the events template and 
			//display it in the pop up.
			spinner.stop();	
			var eventName, startDate, timeZone, logoURL, eventURL, listItemTemplate;
			var eventObjList = [];
			$("div#message-div h2").empty();
			if (data.events.length < 1) {
				$("div#message-div h2").text("No events found.");
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
					//Create objecy with needed parameters for displaying events
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
			$("div#message-div h2").html("Network Error.");	
			$("#event-container").empty();
		});
}

