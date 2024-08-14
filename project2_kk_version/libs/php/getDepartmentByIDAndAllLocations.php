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

// QUERY 1: get dept by id
$query = $conn->prepare('SELECT id as departmentId, name as departmentName, locationID as locationId FROM department WHERE id = ?');

$query->bind_param("i", $_POST['id']);

$query->execute();

if (false === $query) {
	$output['status']['code'] = "400";
	$output['status']['name'] = "executed";
	$output['status']['description'] = "query failed";
	$output['data'] = [];

	mysqli_close($conn);

	echo json_encode($output);
	exit;
}

$result = $query->get_result();
$departments = [];
while ($row = mysqli_fetch_assoc($result)) {
	array_push($departments, $row);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";


// Query 2 - get all locations for select container
$query = 'SELECT id as locationId, name as locationName FROM location ORDER BY location.name;';

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

$locations = [];
while ($row = mysqli_fetch_assoc($result)) {
	array_push($locations, $row);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['department'] = $departments[0];
$output['data']['locations'] = $locations;

mysqli_close($conn);

echo json_encode($output);

exit;

