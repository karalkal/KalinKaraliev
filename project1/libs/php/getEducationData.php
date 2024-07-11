<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Requesting (8 properties): 
// Government expenditure on education, total (% of GDP), Pupil-teacher ratio, primary, School enrollment, primary (% net), School enrollment, secondary (% net)
// Unemployment, female (% of female labor force) (modeled ILO estimate), Unemployment, male (% of male labor force) (modeled ILO estimate), 
// Children in employment, total (% of children ages 7-14), Population living in slums (% of urban population)

$url = 'http://api.worldbank.org/v2/country/' . $_REQUEST['countryCodeIso2'] .
    '/indicator/SE.XPD.TOTL.GD.ZS;SE.PRM.ENRL.TC.ZS;SE.PRM.NENR;SE.SEC.NENR;SL.UEM.TOTL.FE.ZS;SL.UEM.TOTL.MA.ZS;SL.TLF.0714.ZS;EN.POP.SLUM.UR.ZS' .
    '?source=2&format=json&date=' . $_REQUEST['timeFrame'] . '&per_page=400';        // request up to 200 results in one page just in case

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