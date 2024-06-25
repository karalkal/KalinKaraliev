<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Requesting (8 properties): GDP (current US$), GDP growth (annual %), GDP per capita growth (annual %), 
// Imports of goods and services (BoP, current US$), Exports of goods and services (BoP, current US$), Current account balance (BoP, current US$)
// Population below national poverty line (%), Gini index
$url = 'http://api.worldbank.org/v2/country/' . $_REQUEST['countryCodeIso3'] .
    '/indicator/BN.CAB.XOKA.CD;BM.GSR.GNFS.CD;BX.GSR.GNFS.CD;NY.GDP.MKTP.KD.ZG;NY.GDP.MKTP.CD;NY.GDP.PCAP.KD.ZG;NY.GDP.PCAP.KD.ZG;SI.POV.NAHC;SI.POV.GINI' .
    '?source=2&format=json&date=' . $_REQUEST['timeFrame'] . '&per_page=200';        // request up to 200 results in one page just in case

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$resultJson = curl_exec($ch);
// echo 'RES:\n' . $resultJson . '';

curl_close($ch);

$decodedData = json_decode($resultJson, true);
// print_r($decodedData);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decodedData;


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);