<?php

// remove next two lines for production	
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include ("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {

	$output['status']['code'] = "300";
	$output['status']['name'] = "failure";
	$output['status']['description'] = "database unavailable";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [];

	mysqli_close($conn);

	echo json_encode($output);

	exit;
}

// SQL does not accept parameters and so is not prepared
// GET also locationID of department to check if location can be deleted safely with CASCADE
// TODO: need to implement this at DB level too
// $query = 'SELECT department.id as departmentId, department.name as departmentName, department. locationID as locationId, location.name as locationName FROM department LEFT JOIN location ON (location.id = department.locationID) ORDER BY location.name;';
$query = 'SELECT department.id as departmentId, department.name as departmentName, department. locationID as locationId, location.name as locationName FROM department LEFT JOIN location ON (location.id = department.locationID) ORDER BY department.name;';

$result = $conn->query($query);

if (!$result) {

	$output['status']['code'] = "400";
	$output['status']['name'] = "executed";
	$output['status']['description'] = "query failed";
	$output['data'] = [];

	mysqli_close($conn);

	echo json_encode($output);

	exit;
}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
	array_push($data, $row);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $data;

mysqli_close($conn);

echo json_encode($output);
exit;

