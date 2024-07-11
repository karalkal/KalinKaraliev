<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Requesting (8 properties): "Life expectancy at birth, male (years)", "Life expectancy at birth, female (years)", 
// "Population density (people per sq. km of land area)", "Population growth (annual %)", 
// "Urban population (% of total population)", "Rural population (% of total population)", 
// "Population, total", "Land area (sq. km)"

$url = 'http://api.worldbank.org/v2/country/' . $_REQUEST['countryCodeIso2'] .
    '/indicator/SP.DYN.LE00.MA.IN;SP.DYN.LE00.FE.IN;EN.POP.DNST;SP.POP.GROW;SP.URB.TOTL.IN.ZS;SP.RUR.TOTL.ZS;SP.POP.TOTL;AG.LND.TOTL.K2' .
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