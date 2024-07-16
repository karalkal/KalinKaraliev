<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// NOTE: longitude param is called lon in this API
// example URL: https://api.openweathermap.org/data/2.5/weather?appid=cabebd5bf39ecdc54982ba9d45841f89&units=metric&lat=37.98381&lon=23.727539
$weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?appid=cabebd5bf39ecdc54982ba9d45841f89&units=metric&lat=' . $_REQUEST['lat'] . '&lon=' . $_REQUEST['lng'];
$forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast?appid=cabebd5bf39ecdc54982ba9d45841f89&units=metric&lat=' . $_REQUEST['lat'] . '&lon=' . $_REQUEST['lng'];

// GET CURRENT WEATHER
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $weatherUrl);

$weatherJson = curl_exec($ch);

curl_close($ch);

$decodedWeatherData = json_decode($weatherJson, true);

$output['data']['weatherArr'] = $decodedWeatherData['weather'];
$output['data']['main'] = $decodedWeatherData['main'];
$output['data']['wind'] = $decodedWeatherData['wind']['speed'];
$output['data']['clouds'] = $decodedWeatherData['clouds']['all'];

// GET FORECAST
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $forecastUrl);

$forecastJson = curl_exec($ch);

curl_close($ch);

$decodedForecastData = json_decode($forecastJson, true);

$output['data']['forecastData'] = $decodedForecastData['list'];

curl_close($ch);

$decodedWeatherForecastData = json_decode($forecastJson, true);

// attach status info
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);