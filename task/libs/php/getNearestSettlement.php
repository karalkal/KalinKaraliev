<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


$url = 'http://api.geonames.org/findNearbyPlaceNameJSON?lang=local&cities=cities1000&radius=300&lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=kurcho&style=full';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
if (sizeof($decode['geonames']) > 0) {
    $output['data'] = $decode['geonames'][0];
    $output['status']['foundTown'] = true;
} else {
    $output['status']['foundTown'] = false;
}


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>