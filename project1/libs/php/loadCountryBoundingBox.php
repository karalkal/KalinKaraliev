<?php

$executionStartTime = microtime(true);

$resultJson = file_get_contents('../../countryCodesWithBoundingBox.json');
// lowercase country codes in json
$countryCodeIso2 = strtolower($_GET['countryCodeIso2']);

$decodedDataArray = json_decode($resultJson, true);

$selectedCountry = $decodedDataArray[$countryCodeIso2];
// print_r($selectedCountry);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data']['localCountryData'] = $selectedCountry;


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);