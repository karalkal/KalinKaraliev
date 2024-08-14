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

// first query - staffId, firstName, lastName, jobTitle, email, departmentId (SQL statement accepts parameters and so is prepared to avoid SQL injection)
$query = $conn->prepare('SELECT p.id as staffId, p.lastName, p.firstName, p.jobTitle, p.email, d.id as departmentId FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) WHERE p.id = ?');

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

$personnel = [];

while ($row = mysqli_fetch_assoc($result)) {
	array_push($personnel, $row);
}

// second query (for select) - does not accept parameters and so is not prepared
$query = 'SELECT d.id as departmentId, d.name as departmentName from department d LEFT JOIN location l ON (d.locationID = l.id) ORDER BY d.name;';

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

$departments = [];

while ($row = mysqli_fetch_assoc($result)) {
	array_push($departments, $row);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['employee'] = $personnel[0];
$output['data']['departments'] = $departments;

mysqli_close($conn);

echo json_encode($output);