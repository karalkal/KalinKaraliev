import titleizeString from "./utils/stringTitleizer.js";
import validateEmail from "./utils/emailValidator.js";


let allStaff = [];
let allDepartments = [];
let allLocations = [];

// upon initialization only staff data is required
getAndDisplayAllStaff();

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

	$('.genericModal').on('hidden.bs.modal', function () {
		console.log("claering modal?...")
		$('.genericModal #modal-title').html("");
		$('.genericModal #modal-body').html("");
		$('.genericModal #modal-footer').html("");
	});

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


	/*     ========     SEARCH     ========     */
	// In personnel firstName, lastName, email, jobTitle, dept. name, loc. name
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


	/*     ========     FILTER     ========     */
	$("#filterBtn").click(function () {
		// apply a filter to the personnel table on either department or location
		$("#filterPersonnelModal").modal("show");
		// reset optins values each re-render
		$("#filterPersonnelByLocation").val("0");
		$("#filterPersonnelByDepartment").val("0");
	});

	// Once modal is shown populate both select elements
	$("#filterPersonnelModal").on("show.bs.modal", function (e) {
		$.ajax({
			url: "libs/php/getAllDepartments.php",
			type: 'GET',
			dataType: 'json',

			success: function (result) {
				allDepartments = result.data;
				$.each(allDepartments, function (i, dept) {
					$("#filterPersonnelByDepartment").append(
						$("<option>", {
							value: dept.departmentId,
							text: dept.departmentName,
						})
					);
				});
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error getting departments data.");
			}
		});

		$.ajax({
			url: "libs/php/getAllLocations.php",
			type: 'GET',
			dataType: 'json',

			success: function (result) {
				allLocations = result.data;
				$.each(allLocations, function (i, location) {
					$("#filterPersonnelByLocation").append(
						$("<option>", {
							value: location.locationId,
							text: location.locationName,
						})
					);
				});
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error getting locations data.");
			}
		});
	});

	// If dept is selected disable locations and the other way round
	$('#filterPersonnelByDepartment').change(function () {
		let optionSelected = $(this).find("option:selected");
		let departmentId = optionSelected.val();
		$("#filterPersonnelByLocation").val("0");
		if (departmentId == 0) {
			getAndDisplayAllStaff();
		} else {
			let filteredResults = allStaff.filter(l => l.departmentId === departmentId);
			displayFilteredResults(filteredResults);
		}
	});

	$('#filterPersonnelByLocation').change(function () {
		let optionSelected = $(this).find("option:selected");
		let locationId = optionSelected.val();
		$("#filterPersonnelByDepartment").val("0");
		if (locationId == 0) {
			getAndDisplayAllStaff();
		} else {
			let filteredResults = allStaff.filter(l => l.locationId === locationId);
			displayFilteredResults(filteredResults);
		}
	});

	// display create staff/dept/location modal depending on which Btn is active
	$("#addBtn").click(function () {
		if ($("#personnelBtn").hasClass("active")) {
			$("#createPersonnelModal").modal("show");
		}
		else if ($("#departmentsBtn").hasClass("active")) {
			$("#createDepartmentModal").modal("show");
		}
		else if ($("#locationsBtn").hasClass("active")) {
			$("#createLocationModal").modal("show");
		}
	});


	/*     ========     CREATE     ========     */
	// create Location
	$("#createLocationForm").on("submit", function (e) {
		e.preventDefault();
		let newLocationName = titleizeString($("#createLocationName").val());

		// AJAX call to save form data
		$.ajax({
			url: "libs/php/insertLocation.php",
			type: "POST",
			dataType: "json",
			data: {
				locationName: newLocationName
			},
			success: function (result) {
				$("#createLocationModal").modal("toggle");
				$('#createLocationModal').on('hidden.bs.modal', function () {
					$(this).find('form')[0].reset();
				});

				if (result && result.status && result.status.code == 200) {
					$('.genericModal #modal-title').html(`Created location ${newLocationName}`);
					$('.genericModal #modal-body').empty();
					$('.genericModal #modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					$(".genericModal").modal("show");

					// send new GET request and display updated data
					getAndDisplayAllLocations()

				} else {	// code is not 200
					renderErrorModal("Error writing data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error writing data");
			}
		});
	})

	// create Department
	$("#createDepartmentModal").on("show.bs.modal", function (e) {
		$.ajax({
			url: "libs/php/getAllLocations.php",
			type: 'GET',
			dataType: 'json',

			success: function (result) {
				allLocations = result.data;
				$.each(allLocations, function (i, location) {
					$("#createDepartmentLocation").append(
						$("<option>", {
							value: location.locationId,
							text: location.locationName,
						})
					);
				});
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error getting locations data.");
			}
		});
	});

	$("#createDepartmentForm").on("submit", function (e) {
		e.preventDefault();
		let newDeptName = titleizeString($("#createDepartmentName").val());
		let locationId = $('#createDepartmentLocation option').filter(':selected').val();

		$.ajax({
			url: "libs/php/insertDepartment.php",
			type: "POST",
			dataType: "json",
			data: {
				deptName: newDeptName,
				locationId: locationId,
			},
			success: function (result) {
				$("#createDepartmentModal").modal("toggle");
				$('#createDepartmentModal').on('hidden.bs.modal', function () {
					$(this).find('form')[0].reset();
				});

				if (result && result.status && result.status.code == 200) {
					$('.genericModal #modal-title').html(`Created department ${newDeptName}`);
					$('.genericModal #modal-body').empty();
					$('.genericModal #modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					$(".genericModal").modal("show");

					// send new GET request and display updated data
					getAndDisplayAllDepartments();

				} else {	// code is not 200
					renderErrorModal("Error writing data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error writing data");
			}
		});
	});

	// create Employee
	$("#createPersonnelModal").on("show.bs.modal", function (e) {
		// populate locations select element
		$.ajax({
			url: "libs/php/getAllDepartments.php",
			type: 'GET',
			dataType: 'json',

			success: function (result) {
				allDepartments = result.data;
				$.each(allDepartments, function (i, dept) {
					$("#createPersonnelDepartment").append(
						$("<option>", {
							value: dept.departmentId,
							text: dept.departmentName,
						})
					);
				});
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error getting departments data.");
			}
		});
	});

	$("#createPersonnelForm").on("submit", function (e) {
		e.preventDefault();
		let newStaffFirstName = titleizeString($("#createPersonnelFirstName").val());
		let newStaffLastName = titleizeString($("#createPersonnelLastName").val());
		let newStaffJobTitle = titleizeString($("#createPersonnelJobTitle").val());
		let newStaffEmail = $("#createPersonnelEmailAddress").val().toLowerCase();		// convert email to lower
		let deptId = Number($('#createPersonnelDepartment option').filter(':selected').val());


		if (validateEmail(newStaffEmail) == false) {		//invalid email
			$("#createPersonnelModal").modal("toggle");
			renderErrorModal(`Invalid email format for:<br>${newStaffEmail}`);
		}
		else {
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
					$("#createPersonnelModal").modal("toggle");
					$('#createPersonnelModal').on('hidden.bs.modal', function () {
						$(this).find('form').trigger('reset');
					});

					if (result && result.status && result.status.code == 200) {
						$('.genericModal #modal-title').html(`Created employee:<br>${newStaffFirstName}, ${newStaffFirstName}`);
						$('.genericModal #modal-body').empty();
						$('.genericModal #modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
					`)

						$(".genericModal").modal("show");

						// send new GET request and display updated data
						getAndDisplayAllStaff()

					} else {	// code is not 200
						renderErrorModal("Error writing data")
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					renderErrorModal("Error writing data")
				}
			});
		}
	});


	// DELETE
	/*  Instead of creating event handlers after elements are mounted to DOM it looks neater 
		to move this functionality outside rendering functions. 
		Use this syntax to register DOM events before an element exists. Note that "data-id" is string.*/

	// delete Employee
	$('body').on('click', '.deleteStaffBtn', function (e) {
		let staffId = $(e.currentTarget).attr("data-id");
		deleteStaff(staffId);
	});

	// delete Department
	$('body').on('click', '.deleteDepartmentBtn', function (e) {
		let deptId = $(e.currentTarget).attr("data-id");
		$.ajax({
			url: "libs/php/preDeleteDepartmentCheck.php",
			type: "POST",
			dataType: "json",
			data: { id: deptId },
			success: function (result) {
				const { departmentName, personnelCount } = result.data[0];
				if (result.status.code == 200) {
					if (personnelCount == 0) {		// if NO entry in another table refers to this ID
						deleteDepartment(deptId, departmentName)
					} else {
						// message will be like Location London cannot be deleted while 3 department(s)...
						renderCannotDeleteModal("Department", departmentName, personnelCount, "employee(s)");
					}
				} else {	// code is not 200
					renderErrorModal("Something went wrong.")
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Something went wrong.")
			}
		});
	});

	// delete Location
	$('body').on('click', '.deleteLocationBtn', function (e) {
		let locationId = $(e.currentTarget).attr("data-id");
		$.ajax({
			url: "libs/php/preDeleteLocationCheck.php",
			type: "POST",
			dataType: "json",
			data: { id: locationId },
			success: function (result) {
				const { locationName, departmentsCount } = result.data[0];
				if (result.status.code == 200) {
					if (departmentsCount == 0) {		// if NO entry in another table refers to this ID
						deleteLocation(locationId, locationName)
					} else {
						// message will be like Location London cannot be deleted while 3 department(s)...
						renderCannotDeleteModal("Location", locationName, departmentsCount, "department(s)");
					}
				} else {	// code is not 200
					renderErrorModal("Something went wrong.")
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Something went wrong.")
			}
		});
	});

	/*     ========     UPDATE     ========     */
	// update Location
	$("#editLocationModal").on("show.bs.modal", function (e) {
		const locationId = $(e.relatedTarget).attr("data-id");
		$.ajax({
			url: "libs/php/getLocationByID.php",
			type: "POST",
			dataType: "json",
			data: { id: locationId },
			success: function (result) {
				if (result.status.code == 200) {
					populateEditLocationModal(result.data);
				} else {
					renderErrorModal("Error retrieving data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error retrieving data");
			}
		});
	});

	$("#editLocationForm").on("submit", function (e) {
		e.preventDefault();
		let locationId = $("#editLocationID").val();
		let newLocationName = titleizeString($("#editLocationName").val());

		$.ajax({
			url: "libs/php/updateLocationByID.php",
			type: "POST",
			dataType: "json",
			data: {
				id: locationId,
				newLocationName: newLocationName,
			},
			success: function (result) {
				$("#editLocationModal").modal("toggle");
				$('#editLocationModal').on('hidden.bs.modal', function () {
					$(this).find('form').trigger('reset');
				});
				if (result && result.status && result.status.code == 200) {
					$('.genericModal #modal-title').html(`Updated location to ${newLocationName}`);
					$('.genericModal #modal-body').empty();
					$('.genericModal #modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					$(".genericModal").modal("show");
					// send new GET request and display updated data
					getAndDisplayAllLocations()

				} else {	// code is not 200
					renderErrorModal("Error updating data.")
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error updating data.");
			}
		});
	})

	// update Department
	$("#editDepartmentModal").on("show.bs.modal", function (e) {
		$.ajax({
			url: "libs/php/getDepartmentByIDAndAllLocations.php",
			type: "POST",
			dataType: "json",
			data: {
				id: $(e.relatedTarget).attr("data-id")		// Retrieves the data-id attribute from the calling button
			},
			success: function (result) {
				if (result.status.code == 200) {
					populateEditDepartmentModal(result.data);
				} else {
					renderErrorModal("Error retrieving data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error retrieving data");
			}
		});
	});

	$("#editDepartmentForm").on("submit", function (e) {
		e.preventDefault();
		let departmentId = $("#editDepartmentID").val();
		let newDeptName = titleizeString($("#editDepartmentName").val());
		let locationId = $('#editDepartmentLocation option').filter(':selected').val();

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
				$("#editDepartmentModal").modal("toggle");
				$('#editDepartmentModal').on('hidden.bs.modal', function () {
					$(this).find('form').trigger('reset');
				});

				if (result && result.status && result.status.code == 200) {
					$('.genericModal #modal-title').html(`Updated department ${newDeptName}`);
					$('.genericModal #modal-body').empty();
					$('.genericModal #modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					$(".genericModal").modal("show");

					// send new GET request and display updated data
					getAndDisplayAllDepartments();

				} else {	// code is not 200
					renderErrorModal("Error updating data.");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error updating data.");
			}
		});
	});

	// update Employee
	$("#editPersonnelModal").on("show.bs.modal", function (e) {
		$.ajax({
			url: "libs/php/getStaffByIDAndAllDepartments.php",
			type: "POST",
			dataType: "json",
			data: {
				id: $(e.relatedTarget).attr("data-id")		// Retrieves the data-id attribute from the calling button
			},
			success: function (result) {
				if (result.status.code == 200) {
					populateEditPersonnelModal(result.data);
				} else {
					renderErrorModal("Error retrieving data");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error retrieving data");
			}
		});
	});

	$("#editPersonnelForm").on("submit", function (e) {
		e.preventDefault();

		let staffId = $("#editPersonnelEmployeeID").val()
		let firstName = titleizeString($("#editPersonnelFirstName").val());
		let lastName = titleizeString($("#editPersonnelLastName").val());
		let jobTitle = titleizeString($("#editPersonnelJobTitle").val());
		let email = $("#editPersonnelEmailAddress").val().toLowerCase();		// convert email to lower
		// let departmentId = $('#editPersonnelEmployeeID').val();
		let departmentId = $('#editPersonnelDepartment option').filter(':selected').val();

		if (validateEmail(email) == false) {		//invalid email
			$("#editPersonnelModal").modal("toggle");
			renderErrorModal(`Invalid email format for:<br>${email}`)
		}
		else {
			$.ajax({
				url: "libs/php/updateStaffByID.php",
				type: "POST",
				dataType: "json",
				data: {
					staffId: staffId,
					updatedFirst: firstName,
					updatedLast: lastName,
					updatedJobTitle: jobTitle,
					updatedEmail: email,
					departmentId: departmentId,
				},
				success: function (result) {
					$("#editPersonnelModal").modal("toggle");
					$('#editPersonnelModal').on('hidden.bs.modal', function () {
						$(this).find('form').trigger('reset');
					});

					if (result && result.status && result.status.code == 200) {
						$('.genericModal #modal-title').html(`Updated employee:<br>${lastName}, ${firstName}`);
						$('.genericModal #modal-body').empty();
						$('.genericModal #modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

						$(".genericModal").modal("show");

						// send new GET request and display updated data
						getAndDisplayAllStaff()

					} else {	// code is not 200
						renderErrorModal("Error updating data.");
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					renderErrorModal("Error updating data.");
				}
			});
		}
	});
});


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
			renderErrorModal("Error getting personnel data.");
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
			renderErrorModal("Error getting departments data.");
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
			renderErrorModal("Error getting locations data.");
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
		updateStaffBtn.classList.add("btn", "btn-primary", "btn-sm", "me-1", "updateStaffBtn");
		updateStaffBtn.setAttribute("data-bs-toggle", "modal");
		updateStaffBtn.setAttribute("data-bs-target", "#editPersonnelModal");
		updateStaffBtn.setAttribute("data-id", employee.staffId);
		let updateStaffBtnIcon = document.createElement("i");
		updateStaffBtnIcon.classList.add("fa-solid", "fa-pencil", "fa-fw");
		updateStaffBtn.appendChild(updateStaffBtnIcon);

		let deleteStaffBtn = document.createElement("button");
		deleteStaffBtn.classList.add("btn", "btn-primary", "btn-sm", "deleteStaffBtn");
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
		updateDptBtn.setAttribute("data-bs-toggle", "modal");
		updateDptBtn.setAttribute("data-bs-target", "#editDepartmentModal");
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
		updateLocationBtn.setAttribute("data-bs-toggle", "modal");
		updateLocationBtn.setAttribute("data-bs-target", "#editLocationModal");
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

function renderErrorModal(message) {
	console.log("ERROR", message)
	$("#errorModal #modal-title").html(message);
	$('#errorModal #modal-body').empty();
	$('#errorModal #modal-footer').html(`						
		<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			CLOSE
		</button>`)
	$("#errorModal").modal("show");
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
			renderErrorModal("Something went wrong");
		}
	});
}

function displayFilteredResults(filteredResults) {
	// DO NOT hide modal
	// $(".genericModal").modal("hide");

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

function deleteLocation(locationId, locationToDeleteName) {
	// populate modal
	$('.genericModal #modal-title').text("Remove Location?");
	$('.genericModal #modal-body').html(`
		<p>Please confirm you wish to remove location:</p>
		<form id="deleteLocationForm">
		    <input type="hidden" id="${locationId}">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none shadow-none pt-2" value="${locationToDeleteName}" readonly>
			</div>
		</form>
		`);

	$('.genericModal #modal-footer').html(`
		<button type="submit" 
			form="deleteLocationForm" class="btn btn-outline-primary btn-sm myBtn">
			YES
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			NO
		</button>
		`)

	// now show modal
	$(".genericModal").modal("show");

	// send delete request with ID param
	$("#deleteLocationForm").on("submit", function (e) {
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
					$('.genericModal #modal-title').html(`Deleted location:<br>${locationToDeleteName}`);
					$('.genericModal #modal-body').empty();
					$('.genericModal #modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllLocations()

				} else {	// code is not 200
					renderErrorModal("Error deleting data.");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error deleting data.");
			}
		});
	})
}

function deleteDepartment(departmentId, deptToDeleteName) {
	// populate modal
	$('.genericModal #modal-title').text("Remove Department?");
	$('.genericModal #modal-body').html(`
		<p>Please confirm you wish to remove department:</p>
		<form id="deleteDepartmentForm">
		    <input type="hidden" id="${departmentId}">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none shadow-none pt-2" value="${deptToDeleteName}" readonly>
			</div>
		</form>
		`);
	$('.genericModal #modal-footer').html(`
		<button type="submit" 
			form="deleteDepartmentForm" class="btn btn-outline-primary btn-sm myBtn">
			YES
		</button>
        <button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
			NO
		</button>
		`)

	// now show modal
	$(".genericModal").modal("show");

	// send delete request with ID param
	$("#deleteDepartmentForm").on("submit", function (e) {
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
					$('.genericModal #modal-title').html(`Deleted department:<br>${deptToDeleteName}`);
					$('.genericModal #modal-body').empty();
					$('.genericModal #modal-footer').html(`						
						<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
							CLOSE
						</button>
						`)

					// send new GET request and display updated data
					getAndDisplayAllDepartments()

				} else {	// code is not 200
					renderErrorModal("Error deleting data.");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error deleting data.");
			}
		});
	})
}

function deleteStaff(staffId) {
	const staffToDelete = allStaff.find(s => s.staffId === staffId);
	const { lastName, firstName } = staffToDelete;
	// populate modal
	$('.genericModal #modal-title').text("Remove Staff?");
	$('.genericModal #modal-body').html(`
		<p>Please confirm you wish to remove employee:</p>
		<form id="deleteStaffForm">
		    <input type="hidden" id="${staffId}">
			<div class="form-floating mb-3">
				<input type="text" class="form-control shadow-none shadow-none pt-2" value="${lastName}, ${firstName}" readonly>
			</div>
		</form>
		`);

	$('.genericModal #modal-footer').html(`
			<button type="submit" 
				form="deleteStaffForm" class="btn btn-outline-primary btn-sm myBtn">
				YES
			</button>
			<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
				NO
			</button>
			`)

	// now show modal
	$(".genericModal").modal("show");

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
					renderErrorModal("Error deleting data.");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				renderErrorModal("Error deleting data.");
			}
		});
	})
}

function renderCannotDeleteModal(parentTypeStr, parentName, childCount, childTypeStr) {
	$('#modal-title').html(`Cannot delete`);
	$('#modal-body').text(`${parentTypeStr} ${parentName} cannot be deleted while ${childCount} ${childTypeStr} refer to it.`);
	$('#modal-footer').html(`						
									<button type="button" class="btn btn-outline-primary btn-sm myBtn" data-bs-dismiss="modal">
										CLOSE
									</button>
						`)
	// now show modal
	$(".genericModal").modal("show");
}

function populateEditLocationModal(data) {
	const { locationId, locationName } = data[0]; //data is array here
	$('#editLocationForm #editLocationID').val(locationId);
	$('#editLocationForm #editLocationName').val(locationName);
}

function populateEditDepartmentModal(data) {
	const { department, locations } = data;
	let { departmentId, departmentName, locationId } = department;

	// populate modal
	$('#editDepartmentForm #editDepartmentID').val(departmentId);
	$('#editDepartmentForm #editDepartmentName').val(departmentName);

	// clear select element
	$("#editDepartmentForm #editDepartmentLocation").html("");
	// populate locations select element
	$.each(locations, function (i, l) {
		$("#editDepartmentForm #editDepartmentLocation").append(
			$("<option>", {
				value: l.locationId,
				text: l.locationName,
			})
		);
	});
	//set value of select to current 
	$("#editDepartmentForm #editDepartmentLocation").val(locationId);
}

function populateEditPersonnelModal(data) {
	const { employee, departments } = data;
	let { staffId, firstName, lastName, jobTitle, email, departmentId } = employee;

	// populate modal
	$('#editPersonnelForm #editPersonnelEmployeeID').val(staffId);
	$('#editPersonnelForm #editPersonnelFirstName').val(firstName);
	$('#editPersonnelForm #editPersonnelLastName').val(lastName);
	$('#editPersonnelForm #editPersonnelJobTitle').val(jobTitle);
	$('#editPersonnelForm #editPersonnelEmailAddress').val(email);

	// clear departments select element
	$("#editPersonnelForm #editPersonnelDepartment").html("");
	// populate departments select element
	$.each(departments, function (i, d) {
		$("#editPersonnelForm #editPersonnelDepartment").append(
			$("<option>", {
				value: d.departmentId,
				text: d.departmentName,
			})
		);
	});
	//set value of select to current 
	$("#editPersonnelForm #editPersonnelDepartment").val(departmentId);
}







