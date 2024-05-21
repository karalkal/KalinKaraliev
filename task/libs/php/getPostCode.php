<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// NOTE: getting 8 rows currently
$url = 'http://api.geonames.org/postalCodeSearchJSON?maxRows=8&placename=' . $_REQUEST['placename'] . '&country=' . $_REQUEST['country'] . '&username=kurcho';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

// echo "RESULT:\n" . $result;

curl_close($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
if (sizeof($decode['postalCodes']) > 0) {
    $output['data'] = $decode['postalCodes'];
    $output['status']['foundPostCode'] = true;
} else {
    $output['status']['foundPostCode'] = false;
}

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>