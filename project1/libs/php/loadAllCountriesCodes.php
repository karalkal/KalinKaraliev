<?php

$executionStartTime = microtime(true);

$resultJson = file_get_contents('../../countryBorders.geo.json');

// develop two PHP routines that return subsets of the file contents; 
// one to return a JSON object that contains just the codes and names to populate the select and 
// the other to return just the feature for the selected country so that it can be plotted on the map with L.geoJSON()

$decodedDataArray = json_decode($resultJson, true);
// echo "\nDECODED:\n"; print_r($decodedDataArray['features'][0]['properties']);

// we are interested in 'properties' prop of each country
$allCountriesArr = [];
foreach ($decodedDataArray['features'] as $countryData) {
    array_push($allCountriesArr, $countryData['properties']);
}
// sort array in place
usort($allCountriesArr, function ($a, $b) {
    return strcmp($a['name'], $b['name']);
});
// print_r($truncatedDataArray);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data']['allCountriesArr'] = $allCountriesArr;


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);