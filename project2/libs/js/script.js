import titleizeString from "./utils/stringTitleizer.js";
import validateEmail from "./utils/emailValidator.js";
import sortByName from "./utils/sortArrayOfObjects.js";
import { checkLocationIdInDeptFKeys, checkDeptIdInPersonnelFKeys } from "./utils/preDeleteFKCheck.js";


let allStaff = [];
let allDepartments = [];
let allLocations = [];

// upon initialization only staff data is required but others are needed for select options
getAndDisplayAllStaff();
getAndDisplayAllDepartments();
getAndDisplayAllLocations();

// initial spinner, before page loads
document.onreadystatechange = function (e) {
	if (document.readyState !== 'complete') {
		$('#preloader').show();
	}
};

// trigger preloader while ajax request is pending, else hide it
$(document).on({
	ajaxStart: function () {
		// console.log("waiting for ajax response...")
		$('#mainSection').hide();
		$('#preloader').show();
	},
	ajaxStop: function () {
		$('#mainSection').show();
		$('#preloader').hide();
	}
});

$('document').ready(function () {
	// HIDE PRELOADER when page DOM is ready for JS code to execute
	$("#preloader").hide();

	// GET data from DB and render relevant table upon clicking menu/tab buttons
	$("#personnelBtn").click(function () {
		getAndDisplayAllStaff();
	});
	$("#departmentsBtn").click(function () {
		getAndDisplayAllDepartments();
	});
	$("#locationsBtn").click(function () {
		getAndDisplayAllLocations();
	});

	// REFRESH results for relevant table on click of refresh button
	$("#refreshBtn").click(function () {
		if ($("#personnelBtn").hasClass("active")) {
			getAndDisplayAllStaff();					// Refresh personnel table
		} else if ($("#departmentsBtn").hasClass("active")) {
			getAndDisplayAllDepartments();				// Refresh department table
		} else if ($("#locationsBtn").hasClass("active")) {
			getAndDisplayAllLocations();				// Refresh location table
		}
	});

	// SEARCH in personnel firstName, lastName, email, jobTitle, dept. name, loc. name
	$("#searchInp").on("keyup", function () {
		// if another tab is opened go to default (personnel) tab AND pane, then display results
		$('.nav').find('.active').removeClass('active');
		$("#personnelBtn").addClass("active");

		$('#departments-tab-pane').removeClass('active');
		$('#departments-tab-pane').removeClass('show');
		$('#locations-tab-pane').removeClass('active');
		$('#locations-tab-pane').removeClass('show');
		$('#personnel-tab-pane').addClass('active');
		$('#personnel-tab-pane').addClass('show');

		// Get param and send the get request
		let searchString = $("#searchInp").val();
		searchAndDisplayResults(searchString);
	});

	$("#filterBtn").click(function () {
		// apply a filter to the personnel table on either department or location
		filterStaff();
	});

	// CREATE new staff/dept/location entry depending on which Btn is active
	$("#addBtn").click(function () {
		if ($("#personnelBtn").hasClass("active")) {
			createStaffMember();
		}
		else if ($("#departmentsBtn").hasClass("active")) {
			createDepartment();
		}
		else if ($("#locationsBtn").hasClass("active")) {
			createLocation();
		}
	});

	// DELETE
	// Instead of creating event handlers after elements are mounted to DOM it looks neater to move this functionality outside rendering functions. Use this syntax to register DOM events before an element exists. Note that "data-id" is string.
	$('body').on('click', '.deleteStaffBtn', function (e) {
		let staffId = $(e.currentTarget).attr("data-id");
		deleteStaff(staffId);
	});
	$('body').on('click', '.deleteDepartmentBtn', function (e) {
		let deptId = $(e.currentTarget).attr("data-id");
		deleteDepartment(deptId);
	});
	$('body').on('click', '.deleteLocationBtn', function (e) {
		let locationId = $(e.currentTarget).attr("data-id");
		deleteLocation(locationId);
	});

	// UPDATE
	// Instead of creating event handlers after elements are mounted to DOM it looks neater to move this functionality outside rendering functions. Use this syntax to register DOM events before an element exists. Note that "data-id" is string.
	$('body').on('click', '.updateStaffBtn', function (e) {
		let staffId = $(e.currentTarget).attr("data-id");
		updateStaff(staffId);
	});
	$('body').on('click', '.updateDepartmentBtn', function (e) {
		let deptId = $(e.currentTarget).attr("data-id");
		updateDepartment(deptId);
	});
	$('body').on('click', '.updateLocationBtn', function (e) {
		let locationId = $(e.currentTarget).attr("data-id");
		updateLocation(locationId);
	});
})


function getAndDisplayAllStaff() {
	// Reset search bar each time this btn is clicked
	$("#searchInp").val('');
	$.ajax({
		url: "libs/php/getAllStaff.php",
		type: 'GET',
		dataType: 'json',

		success: function (result) {
			allStaff = result.data;
			renderStaffTable(allStaff);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
			alert("Something went wrong")
		}
	});
}

function getAndDisplayAllDepartments() {
	$.ajax({
		url: "libs/php/getAllDepartments.php",
		type: 'GET',
		dataType: 'json',

		success: function (result) {
			allDepartments = result.data;
			renderDeptTable(allDepartments);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
			alert("Something went wrong")
		}
	});
}

function getAndDisplayAllLocations() {
	$.ajax({
		url: "libs/php/getAllLocations.php",
		type: 'GET',
		dataType: 'json',

		success: function (result) {
			allLocations = result.data;
			renderLocationsTable(allLocations);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
			alert("Something went wrong")
		}
	});
}

function renderStaffTable(staff) {
	// clear table, then re-render with up to date values
	$('#personnelTableBody').empty();

	let documentFragment = document.createDocumentFragment();

	staff.forEach(function (employee, index) {
		let tableRow = document.createElement("tr");
		// name	 
		let staffNameEl = document.createElement("td");
		staffNameEl.classList.add("align-middle", "text-nowrap");
		let staffNameText = document.createTextNode(`${employee.lastName}, ${employee.firstName}`);
		staffNameEl.append(staffNameText);
		tableRow.append(staffNameEl);
		// department	 
		let staffDeptEl = document.createElement("td");
		staffDeptEl.classList.add("align-middle", "text-nowrap", "d-none", "d-md-table-cell");
		let staffDeptText = document.createTextNode(employee.department);
		staffDeptEl.append(staffDeptText);
		tableRow.append(staffDeptEl);
		// location	 
		let staffLocationEl = document.createElement("td");
		staffLocationEl.classList.add("align-middle", "text-nowrap", "d-none", "d-md-table-cell");
		let staffLocationText = document.createTextNode(employee.location);
		staffLocationEl.appendChild(staffLocationText);
		tableRow.appendChild(staffLocationEl);
		// email	 
		let staffEmailEl = document.createElement("td");
		staffEmailEl.classList.add("align-middle", "text-nowrap", "d-none", "d-md-table-cell");
		let staffEmailText = document.createTextNode(employee.email);
		staffEmailEl.append(staffEmailText);
		tableRow.appendChild(staffLocationEl);
		//buttons
		let buttonsContainer = document.createElement("td");
		buttonsContainer.classList.add("text-end", "text-nowrap");

		let updateStaffBtn = document.createElement("button");
		updateStaffBtn.classList.add("btn", "btn-primary", "btn-sm", "updateStaffBtn");
		updateStaffBtn.setAttribute("data-id", employee.staffId);
		let updateStaffBtnIcon = document.createElement("i");
		updateStaffBtnIcon.classList.add("fa-solid", "fa-pencil", "fa-fw");
		updateStaffBtn.appendChild(updateStaffBtnIcon);

		let deleteStaffBtn = document.createElement("button");
		deleteStaffBtn.classList.add("btn", "btn-primary", "btn-sm", "me-1", "deleteStaffBtn");
		deleteStaffBtn.setAttribute("data-id", employee.staffId);
		let deleteStaffBtnIcon = document.createElement("i");
		deleteStaffBtnIcon.classList.add("fa-solid", "fa-trash", "fa-fw");
		deleteStaffBtn.appendChild(deleteStaffBtnIcon);

		buttonsContainer.appendChild(updateStaffBtn);
		buttonsContainer.appendChild(deleteStaffBtn);
		tableRow.appendChild(buttonsContainer);

		// append fragment
		documentFragment.appendChild(tableRow);
	});

	$('#personnelTableBody').append(documentFragment);
}

function renderDeptTable(departments) {
	// clear table, then render with up to date values
	$('#departmentTableBody').empty();

	let documentFragment = document.createDocumentFragment();

	departments.forEach(function (dpt, index) {
		let tableRow = document.createElement("tr");
		// dpt name	 
		let dptNameEl = document.createElement("td");
		dptNameEl.classList.add("align-middle", "text-nowrap");
		let dptNameText = document.createTextNode(dpt.departmentName);
		dptNameEl.append(dptNameText);
		tableRow.append(dptNameEl);
		// location	 
		let dptLocationEl = document.createElement("td");
		dptLocationEl.classList.add("align-middle", "text-nowrap", "d-none", "d-md-table-cell");
		let dptLocationText = document.createTextNode(dpt.locationName);
		dptLocationEl.appendChild(dptLocationText);
		tableRow.appendChild(dptLocationEl);

		//buttons
		let buttonsContainer = document.createElement("td");
		buttonsContainer.classList.add("text-end", "text-nowrap");

		let updateDptBtn = document.createElement("button");
		updateDptBtn.classList.add("btn", "btn-primary", "btn-sm", "me-1", "updateDepartmentBtn");
		updateDptBtn.setAttribute("data-id", dpt.departmentId);
		let updateDptBtnIcon = document.createElement("i");
		updateDptBtnIcon.classList.add("fa-solid", "fa-pencil", "fa-fw");
		updateDptBtn.appendChild(updateDptBtnIcon);

		let deleteDptBtn = document.createElement("button");
		deleteDptBtn.classList.add("btn", "btn-primary", "btn-sm", "deleteDepartmentBtn");
		deleteDptBtn.setAttribute("data-id", dpt.departmentId);
		let deleteDptBtnIcon = document.createElement("i");
		deleteDptBtnIcon.classList.add("fa-solid", "fa-trash", "fa-fw");
		deleteDptBtn.appendChild(deleteDptBtnIcon);

		buttonsContainer.appendChild(updateDptBtn);
		buttonsContainer.appendChild(deleteDptBtn);
		tableRow.appendChild(buttonsContainer);

		// append fragment
		documentFragment.appendChild(tableRow);
	});

	$('#departmentTableBody').append(documentFragment);
}

function renderLocationsTable(locations) {
	// clear table, then render with up to date values
	$('#locationTableBody').empty();

	let documentFragment = document.createDocumentFragment();

	locations.forEach(function (location, index) {
		let tableRow = document.createElement("tr");
		// dpt name	 
		let locationNameEl = document.createElement("td");
		locationNameEl.classList.add("align-middle", "text-nowrap");
		let locationNameText = document.createTextNode(location.locationName);
		locationNameEl.append(locationNameText);
		tableRow.append(locationNameEl);
		//buttons
		let buttonsContainer = document.createElement("td");
		buttonsContainer.classList.add("text-end", "text-nowrap");

		let updateLocationBtn = document.createElement("button");
		updateLocationBtn.classList.add("btn", "btn-primary", "btn-sm", "me-1", "updateLocationBtn");
		updateLocationBtn.setAttribute("data-id", location.locationId);
		let updateLocationBtnIcon = document.createElement("i");
		updateLocationBtnIcon.classList.add("fa-solid", "fa-pencil", "fa-fw");
		updateLocationBtn.appendChild(updateLocationBtnIcon);

		let deleteLocationBtn = document.createElement("button");
		deleteLocationBtn.classList.add("btn", "btn-primary", "btn-sm", "deleteLocationBtn");
		deleteLocationBtn.setAttribute("data-id", location.locationId);
		let deleteLocationBtnIcon = document.createElement("i");
		deleteLocationBtnIcon.classList.add("fa-solid", "fa-trash", "fa-fw");
		deleteLocationBtn.appendChild(deleteLocationBtnIcon);

		buttonsContainer.appendChild(updateLocationBtn);
		buttonsContainer.appendChild(deleteLocationBtn);
		tableRow.appendChild(buttonsContainer);

		// append fragment
		documentFragment.appendChild(tableRow);
	});

	$('#locationTableBody').append(documentFragment);
}

function createLocation() {
	// populate modal
	$('#modal-title').text("Create New Location");
	$('#modal-body').html(`
		<form id="createLocationForm">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none" id="newLocationName" placeholder="New location" required>
				<label for="newLocationName">New location</label>
			</div>
		</form>
		`);

	$('#modal-footer').html(`
		<button type="submit" 
			form="createLocationForm" class="btn btn-outline-primary btn-sm myBtn">
			SAVE
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			CANCEL
		</button>
		`)

	// now show modal
	$("#genericModal").modal("show");

	// get data from form
	$("#createLocationForm").on("submit", function (e) {
		e.preventDefault();
		let newLocationName = titleizeString($("#newLocationName").val());

		// AJAX call to save form data
		$.ajax({
			url: "libs/php/insertLocation.php",
			type: "POST",
			dataType: "json",
			data: {
				locationName: newLocationName
			},
			success: function (result) {
				if (result && result.status && result.status.code == 200) {
					$('#modal-title').html(`Created location:<br>${newLocationName}`);
					$('#modal-body').empty();
					$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllLocations()

				} else {	// code is not 200
					$("#modal-title").replaceWith("Error writing data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$("#modal-title").replaceWith(
					"Error writing data"
				);
			}
		});
	})
}

function createDepartment() {
	// populate modal
	$('#modal-title').text("Create New Department");
	$('#modal-body').html(`
		<form id="createDeptForm">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none" id="newDeptName" placeholder="New department" required>
				<label for="newDeptName">New department</label>
			</div>

			<div class="form-floating">
                <select class="form-select shadow-none" id="locationsSelect" placeholder="Locations">
                </select>
                <label for="locationsSelect">Locations</label>
             </div>
		</form>
		`);

	// populate locations select element
	const sortedLocations = sortByName(allLocations, "locationName");	//second param is prop to sort by
	$.each(sortedLocations, function (i, location) {
		$("#locationsSelect").append(
			$("<option>", {
				value: location.locationId,
				text: location.locationName,
			})
		);
	});

	$('#modal-footer').html(`
		<button type="submit" 
			form="createDeptForm" class="btn btn-outline-primary btn-sm myBtn">
			SAVE
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			CANCEL
		</button>
		`)

	// now show modal
	$("#genericModal").modal("show");

	// get data from form
	$("#createDeptForm").on("submit", function (e) {
		e.preventDefault();
		let newDeptName = titleizeString($("#newDeptName").val());
		let locationId = Number($('#locationsSelect option').filter(':selected').val());

		// AJAX call to save form data
		$.ajax({
			url: "libs/php/insertDepartment.php",
			type: "POST",
			dataType: "json",
			data: {
				deptName: newDeptName,
				locationId: locationId,
			},
			success: function (result) {
				if (result && result.status && result.status.code == 200) {
					$('#modal-title').html(`Created department:<br>${newDeptName}`);
					$('#modal-body').empty();
					$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllDepartments();

				} else {	// code is not 200
					$("#modal-title").replaceWith("Error writing data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$("#modal-title").replaceWith("Error writing data");
			}
		});
	})
}

function createStaffMember() {
	// populate modal
	$('#modal-title').text("Create New Employee");
	$('#modal-body').html(`
		<form id="createStaffForm">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none" id="createStaffFirstName" placeholder="First name" required>
				<label for="createStaffFirstName">First name</label>
			</div>

			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none" id="createStaffLastName" placeholder="Last name" required>
				<label for="createStaffLastName">Last name</label>
			</div>

			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none" id="createStaffJobTitle" placeholder="Job title" required>
				<label for="createStaffJobTitle">Job Title</label>
			</div>

			<div class="form-floating mb-3">
				<input type="email" class="form-control shadow-none" id="createStaffEmailAddress"
					placeholder="Email address" required>
				<label for="createStaffEmailAddress">Email Address</label>
			</div>

			<div class="form-floating">
				<select class="form-select shadow-none" id="departmentSelect" placeholder="Department">
				</select>
				<label for="departmentSelect">Department</label>
			</div>
		</form>
		`);

	// populate locations select element
	const sortedDepartments = sortByName(allDepartments, "departmentName"); //second param is prop to sort by
	$.each(sortedDepartments, function (i, dept) {
		$("#departmentSelect").append(
			$("<option>", {
				value: dept.departmentId,
				text: dept.departmentName,
			})
		);
	});

	$('#modal-footer').html(`
		<button type="submit" 
			form="createStaffForm" class="btn btn-outline-primary btn-sm myBtn">
			SAVE
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			CANCEL
		</button>
		`)

	// now show modal
	$("#genericModal").modal("show");

	// get data from form
	$("#createStaffForm").on("submit", function (e) {
		e.preventDefault();
		let newStaffFirstName = titleizeString($("#createStaffFirstName").val());
		let newStaffLastName = titleizeString($("#createStaffLastName").val());
		let newStaffJobTitle = titleizeString($("#createStaffJobTitle").val());
		let newStaffEmail = $("#createStaffEmailAddress").val().toLowerCase();		// convert email to lower
		let deptId = Number($('#departmentSelect option').filter(':selected').val());

		if (validateEmail(newStaffEmail) == false) {		//invalid email
			$("#modal-title").html(`Invalid email format for:<br>${newStaffEmail}`);
			$('#modal-body').empty();
			$('#modal-footer').html(`						
				<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
					CLOSE
				</button>
				`)
			return;
		}

		// AJAX call to save new staff data
		$.ajax({
			url: "libs/php/insertStaff.php",
			type: "POST",
			dataType: "json",
			data: {
				newStaffFirstName: newStaffFirstName,
				newStaffLastName: newStaffLastName,
				newStaffJobTitle: newStaffJobTitle,
				newStaffEmail: newStaffEmail,
				deptId: deptId,
			},
			success: function (result) {
				if (result && result.status && result.status.code == 200) {
					$('#modal-title').html(`Created staff:<br>${newStaffFirstName, newStaffLastName}`);
					$('#modal-body').empty();
					$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllStaff();

				} else {	// code is not 200
					$("#modal-title").replaceWith("Error writing data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$("#modal-title").replaceWith(
					"Error writing data"
				);
			}
		});
	})
}

function searchAndDisplayResults(searchString) {
	$.ajax({
		url: "libs/php/searchAll.php",
		type: 'POST',
		dataType: 'json',
		data: {
			txt: searchString
		},

		success: function (result) {
			let foundStaff = result.data.found;
			renderStaffTable(foundStaff);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
			alert("Something went wrong")
		}
	});
}

function filterStaff() {
	let departmentId = undefined;
	let locationId = undefined;
	let filteredResults = []
	// populate modal
	$('#modal-title').text("Filter staff");
	$('#modal-body').html(`
		<form id="filterStaffForm">
			<div class="form-floating mt-1">
                <select class="form-select shadow-none pt-1 pb-1" id="departmentsSelect" placeholder="Departments">
				<option selected disabled hidden>All Departments</option>
                </select>
				    <!-- <label for="departmentsSelect">Departments</label> -->
             </div>

			 <div class="form-floating mt-3">
                <select class="form-select shadow-none pt-1 pb-1" id="locationsSelect" placeholder="Locations">
				<option selected disabled hidden>All Locations</option>
                </select>
             </div>
		</form>
		`);

	//second param is prop to sort by
	const sortedDepartments = sortByName(allDepartments, "departmentName");
	const sortedLocations = sortByName(allLocations, "locationName");

	// populate select elements
	$.each(sortedDepartments, function (i, d) {
		$("#departmentsSelect").append(
			$("<option>", {
				value: d.departmentId,
				text: d.departmentName,
			})
		);
	});

	$.each(sortedLocations, function (i, l) {
		$("#locationsSelect").append(
			$("<option>", {
				value: l.locationId,
				text: l.locationName,
			})
		);
	});

	// now show modal
	$("#genericModal").modal("show");

	// id dept is selected disable locations and the other way round
	$('#departmentsSelect').change(function () {
		let optionSelected = $(this).find("option:selected");
		departmentId = optionSelected.val();
		locationId = undefined;
		$('#locationsSelect').hide();
		filteredResults = allStaff.filter(l => l.departmentId === departmentId);
		displayFilteredResults(filteredResults);
	});

	$('#locationsSelect').change(function () {
		let optionSelected = $(this).find("option:selected");
		locationId = optionSelected.val();
		departmentId = undefined;
		$('#departmentsSelect').hide();
		filteredResults = allStaff.filter(l => l.locationId === locationId);
		displayFilteredResults(filteredResults);
	});
}

function displayFilteredResults(filteredResults) {
	// hide modal
	$("#genericModal").modal("hide");

	// if another tab is opened go to default (personnel) tab AND pane
	$('.nav').find('.active').removeClass('active');
	$("#personnelBtn").addClass("active");

	$('#departments-tab-pane').removeClass('active');
	$('#departments-tab-pane').removeClass('show');
	$('#locations-tab-pane').removeClass('active');
	$('#locations-tab-pane').removeClass('show');
	$('#personnel-tab-pane').addClass('active');
	$('#personnel-tab-pane').addClass('show');

	renderStaffTable(filteredResults)
}

function deleteLocation(locationId) {
	const locationToDeleteName = allLocations.find(l => l.locationId === locationId).locationName;
	// populate modal
	$('#modal-title').text("Delete Location?");
	$('#modal-body').html(`
		<form id="deleteLocationForm">
		    <input type="hidden" id="${locationId}">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none shadow-none pt-2" value="${locationToDeleteName}" readonly>
			</div>
		</form>
		`);

	$('#modal-footer').html(`
		<button type="submit" 
			form="deleteLocationForm" class="btn btn-outline-primary btn-sm myBtn">
			DELETE
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			CANCEL
		</button>
		`)

	// now show modal
	$("#genericModal").modal("show");

	// send delete request with ID param
	$("#deleteLocationForm").on("submit", function (e) {
		const locationCannotBeDeleted = checkLocationIdInDeptFKeys(locationId, allDepartments);
		if (locationCannotBeDeleted) {
			$('#modal-title').html(`Cannot delete`);
			$('#modal-body').text(`${locationToDeleteName} cannot be deleted while department(s) refer to it.`);
			$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
			`)

			return
		}

		e.preventDefault();
		$.ajax({
			url: "libs/php/deleteLocationByID.php",
			type: "POST",
			dataType: "json",
			data: {
				id: locationId		// send id param as string
			},
			success: function (result) {
				if (result && result.status && result.status.code == 200) {
					$('#modal-title').html(`Deleted location:<br>${locationToDeleteName}`);
					$('#modal-body').empty();
					$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllLocations()

				} else {	// code is not 200
					$("#modal-title").replaceWith("Error deleting data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$("#modal-title").replaceWith(
					"Error deleting data"
				);
			}
		});
	})
}

function deleteDepartment(departmentId) {
	const deptToDeleteName = allDepartments.find(d => d.departmentId === departmentId).departmentName;
	// populate modal
	$('#modal-title').text("Delete Department?");
	$('#modal-body').html(`
		<form id="deleteDepartmentForm">
		    <input type="hidden" id="${departmentId}">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none shadow-none pt-2" value="${deptToDeleteName}" readonly>
			</div>
		</form>
		`);

	$('#modal-footer').html(`
		<button type="submit" 
			form="deleteDepartmentForm" class="btn btn-outline-primary btn-sm myBtn">
			DELETE
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			CANCEL
		</button>
		`)

	// now show modal
	$("#genericModal").modal("show");

	// send delete request with ID param
	$("#deleteDepartmentForm").on("submit", function (e) {
		const deptCannotBeDeleted = checkDeptIdInPersonnelFKeys(departmentId, allStaff);
		if (deptCannotBeDeleted) {
			$('#modal-title').html(`Cannot delete`);
			$('#modal-body').text(`${deptToDeleteName} cannot be deleted while employee(s) refer to it.`);
			$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
			`)

			return
		}

		e.preventDefault();
		$.ajax({
			url: "libs/php/deleteDepartmentByID.php",
			type: "POST",
			dataType: "json",
			data: {
				id: departmentId		// send id param as string
			},
			success: function (result) {
				if (result && result.status && result.status.code == 200) {
					$('#modal-title').html(`Deleted department:<br>${deptToDeleteName}`);
					$('#modal-body').empty();
					$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllDepartments()

				} else {	// code is not 200
					$("#modal-title").replaceWith("Error deleting data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$("#modal-title").replaceWith("Error deleting data");
			}
		});
	})
}

function deleteStaff(staffId) {
	const staffToDelete = allStaff.find(s => s.staffId === staffId);
	const { lastName, firstName } = staffToDelete;
	// populate modal
	$('#modal-title').text("Delete Staff?");
	$('#modal-body').html(`
		<form id="deleteStaffForm">
		    <input type="hidden" id="${staffId}">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none shadow-none pt-2" value="${lastName}, ${firstName}" readonly>
			</div>
		</form>
		`);

	$('#modal-footer').html(`
		<button type="submit" 
			form="deleteStaffForm" class="btn btn-outline-primary btn-sm myBtn">
			DELETE
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			CANCEL
		</button>
		`)

	// now show modal
	$("#genericModal").modal("show");

	// send delete request with ID param
	$("#deleteStaffForm").on("submit", function (e) {
		e.preventDefault();

		$.ajax({
			url: "libs/php/deleteStaffByID.php",
			type: "POST",
			dataType: "json",
			data: {
				id: staffId		// send id param as string
			},
			success: function (result) {
				if (result && result.status && result.status.code == 200) {
					$('#modal-title').html(`Deleted employee:<br>${lastName}, ${firstName}`);
					$('#modal-body').empty();
					$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllStaff()

				} else {	// code is not 200
					$("#modal-title").replaceWith("Error deleting data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$("#modal-title").replaceWith("Error deleting data");
			}
		});
	})
}

function updateLocation(locationId) {
	const locationToUpdate = allLocations.find(l => l.locationId === locationId);
	const { locationName } = locationToUpdate;
	// populate modal
	$('#modal-title').text("Update Location");
	$('#modal-body').html(`
		<form id="updateLocationForm">
		    <input type="hidden" id="${locationId}">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none shadow-none pt-2" 
				value="${locationName}" 
				id="newLocationName" required>
			</div>
		</form>
		`);

	$('#modal-footer').html(`
		<button type="submit" 
			form="updateLocationForm" class="btn btn-outline-primary btn-sm myBtn">
			UPDATE
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			CANCEL
		</button>
		`)

	// now show modal
	$("#genericModal").modal("show");

	// send delete request with ID param
	$("#updateLocationForm").on("submit", function (e) {
		e.preventDefault();
		let newLocationName = titleizeString($("#newLocationName").val());

		$.ajax({
			url: "libs/php/updateLocationByID.php",
			type: "POST",
			dataType: "json",
			data: {
				id: locationId,
				newLocationName: newLocationName,
			},
			success: function (result) {
				if (result && result.status && result.status.code == 200) {
					$('#modal-title').html(`Updated location:<br>${locationName} to ${newLocationName}`);
					$('#modal-body').empty();
					$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllLocations()

				} else {	// code is not 200
					$("#modal-title").replaceWith("Error updating data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$("#modal-title").replaceWith(
					"Error updating data"
				);
			}
		});
	})
}

function updateDepartment(departmentId) {
	const deptToUpdate = allDepartments.find(d => d.departmentId === departmentId);
	let { departmentName, locationId } = deptToUpdate;
	const originalLocationId = locationId;		// as locationId will be overwritten when option is seleceted
	const deptToUpdateLocationName = allLocations.find(l => l.locationId === locationId).locationName;
	const allLocationsExcludingCurrent = allLocations.filter(l => l.locationId !== locationId);

	// populate modal
	$('#modal-title').text("Update Department");
	$('#modal-body').html(`
		<form id="updateDepartmentForm">
		    <input type="hidden" id="${departmentId}">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none pt-2" 
				value="${departmentName}" 
				id="newDeptName" required>
			</div>

			<div class="form-floating">
                <select class="form-select shadow-none" id="locationsSelect" placeholder="Locations">
                </select>
                <label for="locationsSelect">Locations</label>
             </div>
		</form>
		`);

	//second param is prop to sort by
	const sortedLocations = sortByName(allLocationsExcludingCurrent, "locationName");

	// populate locations select element
	$("#locationsSelect").append($("<option>", {
		value: locationId,
		text: deptToUpdateLocationName,
	}))

	$.each(sortedLocations, function (i, l) {
		$("#locationsSelect").append(
			$("<option>", {
				value: l.locationId,
				text: l.locationName,
			})
		);
	});

	$('#modal-footer').html(`
		<button type="submit" 
			form="updateDepartmentForm" class="btn btn-outline-primary btn-sm myBtn">
			UPDATE
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			CANCEL
		</button>
		`)

	// now show modal
	$("#genericModal").modal("show");

	// send delete request with ID param
	$("#updateDepartmentForm").on("submit", function (e) {
		e.preventDefault();

		let newDeptName = titleizeString($("#newDeptName").val());
		// if new location is picked
		locationId = $('#locationsSelect option').filter(':selected').val();
		const newDeptLocationName = allLocations.find(l => l.locationId === locationId).locationName;
		$.ajax({
			url: "libs/php/updateDepartmentByID.php",
			type: "POST",
			dataType: "json",
			data: {
				departmentId: departmentId,
				locationId: locationId,
				newDeptName: newDeptName,
			},
			success: function (result) {
				if (result && result.status && result.status.code == 200) {
					if (departmentName !== newDeptName) {
						$('#modal-title').html(`${departmentName} renamed to ${newDeptName}`);
					}
					if (originalLocationId !== locationId) {
						$('#modal-title').html(`Moved ${departmentName} to ${newDeptLocationName}`);
					}
					if (departmentName !== newDeptName && originalLocationId !== locationId) {
						$('#modal-title').html(`${departmentName} renamed to ${newDeptName}<br>and moved to ${newDeptLocationName}`);
					}
					$('#modal-body').empty();
					$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllDepartments()

				} else {	// code is not 200
					$("#modal-title").replaceWith("Error updating data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$("#modal-title").replaceWith("Error updating data");
			}
		});
	})
}

function updateStaff(idOfStaffToUpdate) {
	const employeeToUpdate = allStaff.find(s => s.staffId === idOfStaffToUpdate);
	let { staffId, lastName, firstName, jobTitle, email, departmentId, department, location } = employeeToUpdate;
	const allDeptsExcludingCurrent = allDepartments.filter(d => d.departmentId !== departmentId);

	// populate modal
	$('#modal-title').text("Update Employee");
	$('#modal-body').html(`
		<form id="updateStaffForm">
		    <input type="hidden" id="${staffId}">
			<div class="form-floating mb-3">
			    <div class="form-text">First Name (non-editable):</div>
				<input type="text" class="form-control shadow-none pt-2" 
					value="${firstName}" readonly>
			</div>

			<div class="form-floating mb-3">
				<div class="form-text">Last Name (non-editable):</div>
				<input type="text" class="form-control shadow-none pt-2" 
					value="${lastName}" readonly>
			</div>

			<div class="form-floating mb-3">
				<div class="form-text">Job Title:</div>
				<input type="text" class="form-control shadow-none pt-2" 
					value="${jobTitle}" 
					id="updateStaffJobTitle" required>
			</div>

			<div class="form-floating mb-3">
				<div class="form-text">Email:</div>
				<input type="email" 
					class="form-control shadow-none" id="updateStaffEmailAddress"
					placeholder="Email address" required
					value="${email}">
			</div>

			<div class="form-floating">
                <select class="form-select shadow-none" id="departmentsSelect" placeholder="Departments">
                </select>
                <label for="locationsSelect">Departments</label>
             </div>
		</form>
		`);

	// populate locations select element
	$("#departmentsSelect").append($("<option>", {
		value: departmentId,
		text: department,
	}))

	//second param is prop to sort by
	const sortedDepartments = sortByName(allDeptsExcludingCurrent, "departmentName");

	$.each(sortedDepartments, function (i, dept) {
		$("#departmentsSelect").append(
			$("<option>", {
				value: dept.departmentId,
				text: dept.departmentName,
			})
		);
	});

	$('#modal-footer').html(`
		<button type="submit" 
			form="updateStaffForm" class="btn btn-outline-primary btn-sm myBtn">
			UPDATE
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			CANCEL
		</button>
		`)

	// now show modal
	$("#genericModal").modal("show");

	// send delete request with ID param
	$("#updateStaffForm").on("submit", function (e) {
		e.preventDefault();

		departmentId = $('#departmentsSelect option').filter(':selected').val();
		let updatedJobTitle = titleizeString($("#updateStaffJobTitle").val());
		let updatedEmail = $("#updateStaffEmailAddress").val().toLowerCase();		// convert email to lower

		if (validateEmail(updatedEmail) == false) {		//invalid email
			$("#modal-title").html(`Invalid email format for:<br>${updatedEmail}`);
			$('#modal-body').empty();
			$('#modal-footer').html(`						
				<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
					CLOSE
				</button>
				`)
			return;
		}

		// update locationId with selected value
		$.ajax({
			url: "libs/php/updateStaffByID.php",
			type: "POST",
			dataType: "json",
			data: {
				staffId: staffId,
				updatedJobTitle: updatedJobTitle,
				updatedEmail: updatedEmail,
				departmentId: departmentId
			},
			success: function (result) {
				if (result && result.status && result.status.code == 200) {
					$('#modal-title').html(`Updated staff:<br>${firstName, lastName}`);
					$('#modal-body').empty();
					$('#modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllStaff()

				} else {	// code is not 200
					$("#modal-title").replaceWith("Error updating data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$("#modal-title").replaceWith("Error updating data");
			}
		});
	})
}







