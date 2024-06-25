<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// GET primary currency code = if more than one, ignore
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

$output['data']['primaryCurrency'] = $decodedData[0]['currencies'];
$output['data']['countryName'] = $decodedData[0]['name']['common'];       // need it for modal header

$currencyCode = array_keys($decodedData[0]['currencies'])[0];

// Fetching JSON
$exchangeRatesUrl = 'https://v6.exchangerate-api.com/v6/01ac9fbfc7b5ebc39f8b59a7/latest/' . $currencyCode;
$response_json = file_get_contents($exchangeRatesUrl);

// Continuing if we got a result
if (false !== $response_json) {
    // Try/catch for json_decode operation
    try {
        // Decoding
        $response = json_decode($response_json);

        // Check for success
        if ('success' === $response->result) {
            // YOUR APPLICATION CODE HERE, e.g.            
            // Attaching response data to output obj
            $output['data']['exchangeRates'] = $response;
        }

    } catch (Exception $e) {
        // Handle JSON parse error...
        echo 'Message: ' . $e->getMessage();
    }
}

$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);