# EventbriteChromeExtension
Chrome extension for Eventbrite.  Fetch popular events from Eventbrite based on the users location.
Used Google Maps API, Eventbrite API.
Also fetches only the events that happens  on next weekend.



Instuctions to install:
Without crx file:
- Unzip the extension folder.
- Open Extenions tab in Chrome.
- Enable developer mode.
- Drag and drop the folder on to the Chrome.
- The extension will be loaded and available next to the omnibar in Chrome.

Using Crx file:

- If crx file is used for installing, then drag and drop the crx file on to extensions tab of chrome.


Instructions to use:

- Enter the location in the location textbox.
- The popular events happening in that location are displayed below. 
- The default distance used is 10 miles, it can be selected from the dropdown present above.

- If next weekend check box is selected then all the events that happen only on next weekend will be displayed.
- If next weekend check box is not selected then only the popular events within the selected distance will be displayed.

- No change will happen if there is no location entered in the textbox.


Contents:
main.html - Presentation code.
Styles\main.css - CSS Styles.
Scripts\App\ - main.js and utilities.js
main.js - contains code to populate the event details and code for event handling
utilities.js - contains functions required for google maps and data formatting.

Templates\eventlist.html:
Template for displaying event details.

Libraries Used: 
Scripts\Lib

Jquery Version : jquery-1.12.0.min.js
Jquery load template plugin version: jquery.loadTemplate-1.4.4.min.js
spin.min.js for progress indicatior.

