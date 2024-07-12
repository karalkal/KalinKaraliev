<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);
// need to get country/capital data (again) to render in modal header
$countryDataUrl = 'https://restcountries.com/v3.1/alpha/' . $_REQUEST['countryCodeIso2'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $countryDataUrl);

$resultJson = curl_exec($ch);

curl_close($ch);

$decodedcountryData = json_decode($resultJson, true);

$output['data']['capitalName'] = $decodedcountryData[0]['capital'];
$output['data']['countryName'] = $decodedcountryData[0]['name']['common'];

// NOTE: longitude param is called lon in this API
// example URL: https://api.openweathermap.org/data/2.5/weather?appid=cabebd5bf39ecdc54982ba9d45841f89&units=metric&lat=37.98381&lon=23.727539
$weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?appid=cabebd5bf39ecdc54982ba9d45841f89&units=metric&lat=' . $_REQUEST['lat'] . '&lon=' . $_REQUEST['lng'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $weatherUrl);

$resultJson = curl_exec($ch);

curl_close($ch);

$decodedWeatherData = json_decode($resultJson, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";

$output['data']['weatherArr'] = $decodedWeatherData['weather'];
$output['data']['main'] = $decodedWeatherData['main'];
$output['data']['wind'] = $decodedWeatherData['wind']['speed'];
$output['data']['clouds'] = $decodedWeatherData['clouds']['all'];
$output['data']['sunrise'] = $decodedWeatherData['sys']['sunrise'];
$output['data']['sunset'] = $decodedWeatherData['sys']['sunset'];
$output['data']['epochDateTime'] = $decodedWeatherData['dt'];
$output['data']['timezone'] = $decodedWeatherData['timezone'];

$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);