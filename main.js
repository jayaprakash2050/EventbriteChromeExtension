var placeSearch, autocomplete;
var evenBriteToken = "326SDDB4XLUPNNP3NJR4";
var daysOfWeek = new Array(7);
daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var monthNames = new Array(12);
monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

function initAutoComplete() {
	autocomplete = new google.maps.places.Autocomplete(
		(document.getElementById('location')),{types: ['geocode']});
	autocomplete.addListener('place_changed', populateEvents);
}

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

$(document).ready(function(){
	document.getElementById("location").addEventListener("onFocus", geolocate);
});


function populateEvents() {
	var place = autocomplete.getPlace();
	var latitude = place.geometry.location.lat();
	var longitude = place.geometry.location.lng();
	var spinner = '';
	var distanceSelected = 10;	
	distanceSelected = $("#distance").val();
	var url = 'https://www.eventbriteapi.com/v3/events/search/?token='+evenBriteToken+'&location.latitude='+latitude+'&location.longitude='+longitude+'&location.within='+distanceSelected+'mi&popular=true';
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
	$.ajax( { 
		url: url,
		beforeSend: function(xhr) {
			var target = document.getElementById("contentDiv");
			spinner = new Spinner(opts);
			spinner.spin(target);
		}
	})
		.done( function( data ) {
			spinner.stop();	
			var divContent = "<ul class='eventList'>";		
			$.each(data.events, function( key, event ){
				var eventName = event.name.html;
				if (eventName.length > 110) {
					eventName = eventName.substr(0,110);
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
		});
}

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

function calculateNextWeekend(){
	var date = new Date();
	date.setDate((date.getDate() + (7 + 6 - date.getDay()) % 7) + 7);
	date.setHours(00,00,00, 000);
	return date;
}


