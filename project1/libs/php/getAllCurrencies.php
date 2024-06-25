<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Fetching JSON
$supportedCurrenciesUrl = 'https://v6.exchangerate-api.com/v6/01ac9fbfc7b5ebc39f8b59a7/codes';

$response_json = file_get_contents($supportedCurrenciesUrl);

// Continuing if we got a result
if (false !== $response_json) {
    // Try/catch for json_decode operation
    try {
        // Decoding
        $response = json_decode($response_json);

        // Check for success
        if ('success' === $response->result) {
            // print_r($response);
            // YOUR APPLICATION CODE HERE, e.g.
            // Attaching response data to output obj
            $output['data']['supported_codes'] = $response->supported_codes;
        }

    } catch (Exception $e) {
        // Handle JSON parse error...
        echo 'Message: ' . $e->getMessage();
    }
}

$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);