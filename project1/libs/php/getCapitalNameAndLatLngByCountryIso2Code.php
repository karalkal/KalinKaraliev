<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$countryDataUrl = 'https://restcountries.com/v3.1/alpha/' . $_REQUEST['countryCodeIso2'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $countryDataUrl);

$resultJson = curl_exec($ch);

curl_close($ch);

$decodedData = json_decode($resultJson, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

$output['data']['capitalLatLng'] = $decodedData[0]['capitalInfo']['latlng'];  
$output['data']['capitalName'] = $decodedData[0]['capital'][0];  


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);