<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$east = $_GET['east'];
$west = $_GET['west'];
$north = $_GET['north'];
$south = $_GET['south'];
$maxRows = $_GET['maxRows'];

$url = 'http://api.geonames.org/wikipediaBoundingBoxJSON?'
    . 'north=' . $north
    . '&south=' . $south
    . '&east=' . $east
    . '&west=' . $west
    . '&username=kurcho'
    . '&maxRows=' . $maxRows;


$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$resultJson = curl_exec($ch);

curl_close($ch);

$decodedData = json_decode($resultJson, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decodedData;


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);