import titleizeString from "./utils/stringTitleizer.js";
import validateEmail from "./utils/emailValidator.js";
import sortByName from "./utils/sortArrayOfObjects.js";
import { locationIdInDepartmentForeighKeys } from "./utils/preDeleteFKCheck.js";


let allStaff = [];
let departments = [];
let locations = [];

getAndDisplayAllStaff();	// upon initialization only staff table is required
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
		$('#preloader').show();
	},
	ajaxStop: function () {
		// console.log("got ajax response!")
		$('#preloader').hide();
	}
});

$('document').ready(function () {
	// hide preloader when page DOM is ready for JS code to execute
	$("#preloader").hide();

	// GET data from DB and render relevant table upon clicking menu/tab buttons
	$("#personnelBtn").click(function () {
		// Reset search bar each time this btn is clicked
		$("#searchInp").val('');
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
		// Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location

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
	$('body').on('click', '.deleteLocationBtn', function (e) {
		let locationId = $(e.currentTarget).attr("data-id");
		deleteLocation(locationId);
	});


	$("#editPersonnelModal").on("show.bs.modal", function (e) {

		$.ajax({
			url:
				"https://coding.itcareerswitch.co.uk/companydirectory/libs/php/getPersonnelByID.php",
			type: "POST",
			dataType: "json",
			data: {
				// Retrieve the data-id attribute from the calling button
				// see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
				// for the non-jQuery JavaScript alternative
				id: $(e.relatedTarget).attr("data-id")
			},
			success: function (result) {
				var resultCode = result.status.code;

				if (resultCode == 200) {

					// Update the hidden input with the employee id so that
					// it can be referenced when the form is submitted

					$("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

					$("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
					$("#editPersonnelLastName").val(result.data.personnel[0].lastName);
					$("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
					$("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

					$("#editPersonnelDepartment").html("");

					$.each(result.data.department, function () {
						$("#editPersonnelDepartment").append(
							$("<option>", {
								value: this.id,
								text: this.name
							})
						);
					});

					$("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);

				} else {
					$("#editPersonnelModal .modal-title").replaceWith(
						"Error retrieving data"
					);
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$("#editPersonnelModal .modal-title").replaceWith(
					"Error retrieving data"
				);
			}
		});
	});

	// Executes when the form button with type="submit" is clicked
	$("#editPersonnelForm").on("submit", function (e) {

		// Executes when the form button with type="submit" is clicked
		// stop the default browser behviour

		e.preventDefault();

		// AJAX call to save form data

	})
})


function getAndDisplayAllStaff() {
	$.ajax({
		url: "libs/php/getAll.php",
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
			departments = result.data;
			renderDeptTable(departments);
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
			locations = result.data;
			renderLocationsTable(locations);
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

	$.each(staff, function (index, staffRow) {
		$('#personnelTableBody')
			.append($(`<tr>
					<td class="align-middle text-nowrap">
						${staffRow.lastName}, ${staffRow.firstName}
					</td>
					<td class="align-middle text-nowrap d-none d-md-table-cell">
						${staffRow.department}
					</td>
					<td class="align-middle text-nowrap d-none d-md-table-cell">
						${staffRow.location}
					</td>
					<td class="align-middle text-nowrap d-none d-md-table-cell">
						${staffRow.email}
					</td>
					<td class="text-end text-nowrap">
						<button type="button" class="btn btn-primary btn-sm"
							data-bs-toggle="modal"
							data-bs-target="#editPersonnelModal" 
							data-id="${staffRow.staffId}">
							<i class="fa-solid fa-pencil fa-fw"></i>
						</button>

						<button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal"
							data-bs-target="#deletePersonnelModal" 
							data-id="${staffRow.staffId}">
							<i class="fa-solid fa-trash fa-fw"></i>
						</button>
					</td>
				</tr>`));
	});
}

function renderDeptTable(departments) {
	// clear table, then render with up to date values
	$('#departmentTableBody').empty()

	$.each(departments, function (index, deptRow) {
		$('#departmentTableBody')
			.append($(`<tr>
					<td class="align-middle text-nowrap">
						${deptRow.departmentName}
					</td>
					<td class="align-middle text-nowrap d-none d-md-table-cell">
						${deptRow.locationName}
					</td>
					<td class="align-middle text-end text-nowrap">
						<button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal"
							data-bs-target="#editDepartmentModal" 
							data-id="${deptRow.departmentId}">
							<i class="fa-solid fa-pencil fa-fw"></i>
						</button>

						<button type="button" class="btn btn-primary btn-sm" 
							data-bs-target="#deleteDepartmentModal"
							data-id="${deptRow.departmentId}">
							<i class="fa-solid fa-trash fa-fw"></i>
						</button>
					</td>
				</tr>`));
	});
}

function renderLocationsTable(locations) {
	// clear table, then render with up to date values
	$('#locationTableBody').empty()

	$.each(locations, function (index, locationRow) {
		$('#locationTableBody')
			.append($(`<tr>
					<td class="align-middle text-nowrap">
						${locationRow.locationName}
					</td>
					<td class="align-middle text-end text-nowrap">
						<button type="button" class="btn btn-primary btn-sm"
							data-bs-toggle="modal"
							data-bs-target="#editLocationModal" 
							data-id="${locationRow.locationId}">
							<i class="fa-solid fa-pencil fa-fw"></i>
						</button>

						<button type="button" class="btn btn-primary btn-sm deleteLocationBtn" 
							data-bs-target="#deleteDepartmentModal"							
							data-id="${locationRow.locationId}">
							<i class="fa-solid fa-trash fa-fw"></i>
						</button>
					</td>
				</tr>`));


		// $(".deleteLocationBtn").click(function (e) {
		// 	let locationId = $(e.currentTarget).attr("data-id");
		// 	deleteLocation(locationId);
		// })
	});
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
					console.log("SUCCESS!!");
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
	const sortedLocations = sortByName(locations, "locationName");	//second param is prop to sort by
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
					console.log("SUCCESS!!");
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
	$('#modal-title').text("Create New Staff");
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
	const sortedDepartments = sortByName(departments, "departmentName"); //second param is prop to sort by
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
					console.log("SUCCESS!!");
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
	console.log(searchString)
	$.ajax({
		url: "libs/php/searchAll.php",
		type: 'POST',
		dataType: 'json',
		data: {
			txt: searchString
		},

		success: function (result) {
			console.log(result.data.found)
			let foundStaff = result.data.found;
			renderStaffTable(foundStaff);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
			alert("Something went wrong")
		}
	});
}

function deleteLocation(locationId) {
	const locationToDeleteName = locations.find(l => l.locationId === locationId).locationName;
	// populate modal
	$('#modal-title').text("Delete Location");
	$('#modal-body').html(`
		<form id="deleteLocationForm">
		    <input type="hidden" id="${locationId}">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none shadow-none pt-2" value=${locationToDeleteName} readonly>
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
		const cannotBeDeleted = locationIdInDepartmentForeighKeys(locationId, departments);
		console.log(cannotBeDeleted);
		if (cannotBeDeleted) {
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
					console.log("SUCCESS!!");
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





