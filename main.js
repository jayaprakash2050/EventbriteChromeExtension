//Variable declarations
var placeSearch, autocomplete;
var evenBriteToken = "326SDDB4XLUPNNP3NJR4";
var daysOfWeek = new Array(7);
daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var monthNames = new Array(12);
monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//HTML template to fill the Event details on the page
var template = 
"<li class = 'listItem'>\
		<a class = 'hyperlink' href='##eventurl##' target = '_blank'>\
			<div class = 'itemDiv'>\
				<div class = 'imgDiv'>\
					<img src = '##imageurl##' class = 'imageclass'/>\
				</div>\
				<div class = 'titleDiv'>\
					<span class = 'titlespan'>\
						##eventtitle##\
					</span>\
					<br/>\
					<br/>\
					<span class = 'date'>\
						##date##\
					</span>\
				</div>\
			</div>\
		</a>\
	</li>";
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
			autocomplete.setBounds(circle.getBounds());
		});

	}
}
//This is the callback method for Google maps API
function initAutoComplete() {
	autocomplete = new google.maps.places.Autocomplete(
		(document.getElementById('location')),{types: ['geocode']});
	autocomplete.addListener('place_changed', populateEvents);
}

//Event handler for Next weekend check box.
//This fetches all events that will happen on next weekend on selection of that checkbox,
$(document).on("change", "input[id='chkNextWeekend']", function () {
	var place = autocomplete.getPlace();
	if( place != undefined && $("#location").val()) {
		populateEvents();
	}
	else
	{
		alert("Enter Location and try");
	}
});

//Event handler for distance dropdown.
//This fetches the events that will happen within the given distance from given location
$(document).on("change", "select[id='distance']", function () {
	var place = autocomplete.getPlace();
	if( place != undefined && $("#location").val()) {
		populateEvents();
	}
	else
	{
		alert("Enter Location and try");
	}
});

//Function to add geolocate() method as event listener for location textbox, for onFocus event
$(document).ready(function(){
	document.getElementById("location").addEventListener("onFocus", geolocate);
});

//This function calls the Eventbrite API to fetch the events based on the user selection. 
function populateEvents() {
	var place = autocomplete.getPlace();
	var latitude = place.geometry.location.lat();
	var longitude = place.geometry.location.lng();
	var spinner = '';
	//default distance to find events is 10 miles
	var distanceSelected = 10;	
	distanceSelected = $("#distance").val();
	var url = 'https://www.eventbriteapi.com/v3/events/search/?token='+evenBriteToken+'&location.latitude='+latitude+'&location.longitude='+longitude+'&location.within='+distanceSelected+'mi&popular=true';
	/*If next weekend filter is selected then we calculate the next weekend dates and add it as 
	  condition for the Eventbrite API call.
	*/
	if ( $("#chkNextWeekend").prop("checked") ) {
		var nextSat = calculateNextWeekend();
		var nextSun = new Date();
		nextSun.setDate(nextSat.getDate() + 1);
		nextSun.setHours(23,59,59, 999);
		nextSat = nextSat.toJSON();
		nextSat = nextSat.substring(0,nextSat.lastIndexOf('.'))+'Z';
		nextSun = nextSun.toJSON();
		nextSun = nextSun.substring(0,nextSun.lastIndexOf('.'))+'Z';
		url = url + '&start_date.range_start='+encodeURIComponent(nextSat)+'&start_date.range_end='+encodeURIComponent(nextSun);
	}
	//Ajax call for Eventbrite API to fetch the events
	$.ajax( { 
		url: url,
		beforeSend: function(xhr) {
			var target = document.getElementById("contentDiv");
			spinner = new Spinner(opts);
			spinner.spin(target);
		},
		error: function(xhr) {
			spinner.stop();	
			$("#contentDiv").html("<p>Some exception occured.</p>");
		}
	})
		.done( function( data ) {
			//After recieving the data, read the data and populate the events template and 
			//display it in the pop up.
			spinner.stop();	
			var divContent = "<ul class='eventList'>";		
			$.each(data.events, function( key, event ){
				var eventName = event.name.html;
				//Only 100 characters of event name will be displayes in the page.
				if (eventName.length > 100) {
					eventName = eventName.substr(0,100);
				}
				var startDate = new Date(event.start.utc);
				var timeZone = event.start.timezone;
				var logoURL = '';
				if( event.logo ){
					logoURL = event.logo.url;
				}
				var eventURL = event.url;
				startDate = formatDate(startDate);
				var listItemTemplate = template;
				listItemTemplate = listItemTemplate.replace('##eventurl##', eventURL);
				listItemTemplate = listItemTemplate = listItemTemplate.replace('##imageurl##', logoURL);
				listItemTemplate = listItemTemplate.replace('##eventtitle##',eventName);
				listItemTemplate = listItemTemplate.replace('##date##',startDate);
				divContent = divContent + listItemTemplate;
			} );
				divContent = divContent + "</ul>";
				$("#contentDiv").html(divContent);
		})
		.fail( function() {
			spinner.stop();	
			$("#contentDiv").html("<h2>Some exception occured.</h2>");
		});
}
//To format the date for displaying it in the page.
function formatDate( date ){
	var d = date.getDate();
	var day = date.getDay();
	var timeHours = date.getHours();
	var timeMinutes = date.getMinutes();
	timeMinutes = timeMinutes == '0' ? '00' : timeMinutes;
	var month = monthNames[date.getMonth()];
	var am = timeHours >= 12 ? 'PM' : 'AM';
	timeHours = timeHours > 12 ? timeHours-12 : timeHours;
	day = daysOfWeek[day];
	var result = day + ', ' + month + ' ' + d + ' ' + timeHours + ':' + timeMinutes + ' ' + am;
	return result;  
}
//Function to calculate the next weekend based on the current date.
function calculateNextWeekend(){
	var date = new Date();
	date.setDate((date.getDate() + (7 + 6 - date.getDay()) % 7) + 7);
	date.setHours(00,00,00, 000);
	return date;
}


