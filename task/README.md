# Geolocation-AJAX-PHP-CURL-JSON

## Get data for any geolocation on Earth

*Basic app where users enter values for latitude and longitude and the app displays the elevation of the location, some details about the nearest settlement and most recent weather data.*  

## Tech stack utilized in implementation

1. HTML/CSS
2. AJAX
3. PHP (cURL to make HTTP requests)
4. jQuery (event handling, tree traversal and manipulation, rendering data received from the back end)

## Wokflow (of first functionality)

- Info on the page itself outlines its functionality
- User fills in the form inputs
- Upon submission of the form a JS event listener is triggered
- Values are cast to numeric if not empty strings (including NaN, which as we know is type 'number' in JS :-D), then some basic validation is carried out. App will proceed with the request only if numerical values in specific range have been supplied
- The JS file initiates 3 AJAX calls to our PHP backend with the values provided by the user.
- The PHP files workflow is as follow (example getElevationData):
    - Lines 5 and 6 initiate comprehensive error reporting so that you can run the routine directly in the browser and see all output, including errors, echoed to the browser screen. To do this enter the full path of the file as it appears on the web server, file name and extension and then a question mark followed by the parameters, each one separated by an ampersand.  
    `localhost/geonamesExample/libs/php/getCountryInfo.php?lang=en&country=GB`  
    - Line 10 concatenates the url for the API call with the required parameters passed from the “data” section of the AJAX call in the script.js.
    - Lines 12 - 15 initiates the cURL object and sets some parameters. These are often documented by the API provider and the ones that you see are the most used and will work in many scenarios.
    - Line 17 executes the cURL object and stores the results to $result.
    - Line 21 API returns data as JSON and so we decode it as an associative array so that we can append it to $output. 
    - Lines 27 - 29 gets the required properties from the serialised JSON and appends them to “data” property of $output. Then the correct header information for JSON is set and the $output is converted to JSON before sending it
- The front end renders the data in the required fields using jQuery.


## XAMPP troubleshooting on Ubuntu

**changed permissions to:**  
`sudo chmod -R 777 /opt/lampp`

**if error - another server is running:**  
`sudo /etc/init.d/apache2 stop`
**then:**  
`sudo /opt/lampp/lampp start`
**or**  
`sudo /opt/lampp/lampp restart`
