<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$url = 'https://restcountries.com/v3.1/alpha/' . $_REQUEST['countryCodeIso2'];
// $url = 'https://countryinfoapi.com/api/countries/' . $_REQUEST['countryCodeIso3'];
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$resultJson = curl_exec($ch);
// echo 'RES:\n' . $resultJson . '';

curl_close($ch);

$decodedData = json_decode($resultJson, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decodedData;


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);