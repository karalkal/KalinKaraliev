# Gazetteer-AJAX-PHP-CURL-JSON

- An app displaying an interactive map of user-selected country + essential info about it

- Based on Leaflet JavaScript library and additional plugins for it

- Loads data from local json files. 
  - The file countryBorders.geo.json contains *all** (see remark below) countries ISO2 and ISO3 codes, their coordinates in shapes of polygons or multi-poligons.  
  *The data contained in this json in my humble opinion is neither correct (because it does not include territories like Canary Islands (Spain) or Reunion (France) for the relevant countries) nor simplified enough to make these omissions worthwhile (it includes others like French Guyana which distorts the bounding box and general appearance of a country map - a map of France should be the hexagon only, really). It also includes "countries" like North Cyprus (hm, hm, hm...) and some other which are not recognized. However this is the dataset I was supposed to work with and this is the one I had used.

  - The other json file countryCodesWithBoundingBox.json contains plenty of useful data but here we are loading the requested country's Bounding Box only.

- Gets data from the following APIs:
  - [REST Countries](https://restcountries.com/)
  - [World Bank](https://datahelpdesk.worldbank.org/knowledgebase/topics/125589-developer-information)
  - [GeoNames](https://www.geonames.org/export/web-services.html)
  - [OpenWeatherMap](https://api.openweathermap.org)
  - [ExchangeRate-API](https://www.exchangerate-api.com/)
  - [Country Info API](https://countryinfoapi.com)

## Deployment
As of 1 July 2024 app is deployed at:  
https://gazetteer-kk.000webhostapp.com/

## Local Deployment/Development (Ubuntu)
*(After a few attempts couldn't start the GUI. Followed these steps insetad.)*
1. Instal Xampp
2. Place files in /opt/lampp/htdocs
3. Stop Apache server (always staring by default after reboot):
`sudo /etc/init.d/apache2 stop`
4. Then start xampp:
`sudo /opt/lampp/lampp start` and access app at /localhost

## Notes on the implementation code of script.js

- **lines 1- 54** - Initialize the map, map tiles, layers (base and overlay) and markerClusterGroup which will be used to group (cluster) the wikipedia markers.

- **lines 57-135** - Functions `createCityMarker(city)`, `createEarthquakeMarker(earthquake)` and `createWikiMarker(article)` as the name suggests are helper functions to create markers depending on the lat/lng coordinates of the relevant feature.

- **lines 138-170** - Once the main page loads set default value for country iso codes, bounding box and capital coordinates (Greece in this implementation). Also the select container will be populated with dropdown menu options for the countries contained in the locla json (`renderCountriesNamesAndCodes`).  
 If the user **does not allow** location sharing (map.locate), the program will display map and data for default country running the functions below.  
 The same happens once a **select option** has been clicked.  
 If the user **allows** location sharing first the program will run `setCountryOfUserLocation` which will GET the iso code of the country the user is in based on their lat/lng coordinates (getCountryIso2CodeByLatLng). Then from within this function the below functions will be triggered.
  - centerMapOnSelectedCountry
  - loadCountryBoundaries
  - updateCapitalCoordinates
  - getMainCitiesAndSetMarkers
  - getEarthquakesAndSetMarkers
  - getWikiArticlesAndSetMarkers.  

- **lines 172-244** - Render info buttons and attach GET actions to them
- **lines 246-248** - Ensure click on relevant button hides the modal
- **lines 272-452** - The currency conversion forms are rendered after these 2 functions are called. They will perform user input validation while the input is being typed and conversion will be carried out as soon as the input value is changed (keyup) or the output currency is changed (change). 
- **lines 462-504** - Function `centerMapOnSelectedCountry` loads the "shapes" of the selected country. This could be "Polygon" or "MultiPolygon". The array containing the coordinates contains an array which provides the longitude first, then latitude. Hence here we have to swap them for our latlngs array which will then create polygon using the Leaflet method for this. The fitBounds method centers the map. The polygon showing the country's shape will dispapper after 17 seconds.
- **lines 539-560** - Load bounding box of selected country and update cvalues of easternMost, westernMost, northersMost, southernMost. This will be used in the next functions
-  **lines 562-577** - Based on the iso code get the country capital's coordinates and update values. These will be used for later GETting the current weather in the capital.
- **lines 579-606** - getMainCitiesAndSetMarkers, GET 50 results for cities in bounding box. Since API will return all capitals in BB and largest cities first, filter only the ones in the required country and then cut them to 20. Create markers.

- **lines 609-633** - getEarthquakesAndSetMarkers, as above but we do not filter by country.

- **lines 635-668** - getEarthquakesAndSetMarkers, as above **with filtering** by country. In order to make the marker clustering meaningful we have high value for maxRows. Often the API will return a timeout error if no value is returned from its DB (I guess) within 14-15 seconds. So this "error" is more or less intended - if we have little wikipedia articles for a particular country, clustering becomes totally unnecessary.

- **lines 670-802** - The different GET functions will send AJAX request to our backend (written in basic PHP). On success it will trigger our modal rendering function with the data returned and additional parameter identifying what data the modal would actually be displaying, e.g. `renderCountryDataInModal(result.data, "essential")`. Most of these are self-explanatory, including the php scripts. 
In getExchangeRates() the sequence is as follow:
  - Get the codes, names, symbols of all supported currencies (AJAX request to `getAllCurrencies.php`).  
  - If this request is successful send next one to `getExchangeRatesData.php`. It will 1. get essential country data from `https://restcountries.com/v3.1/alpha/`. From there we get the searched country's primary currency (`$decodedData[0]['currencies'];`). 2. Having identified the country's currency we send another request to get exchange rates to all other currencies
  - Having allCurrenciesData and exchangeRatesData for selected currency we can render the conversion forms and all pairs we might want to display.
