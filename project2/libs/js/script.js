let employees = [];
let departments = [];
let locations = [];

getAll();
getAllDepartments();
// getAllLocations();

// initial spinner, before page loads
document.onreadystatechange = function (e) {
	if (document.readyState !== 'complete') {
		$('#preloader').show();
	}
};

// trigger preloader while ajax request is pending, else hide it
$(document).on({
	ajaxStart: function () {
		console.log("waiting for ajax response...")
		$('#preloader').show();
	},
	ajaxStop: function () {
		console.log("got ajax response!")
		$('#preloader').hide();
	}
});

$('document').ready(function () {
	//hide preloader when document.ready
	$("#preloader").hide();

	$("#searchInp").on("keyup", function () {


	});

	$("#refreshBtn").click(function () {

		if ($("#personnelBtn").hasClass("active")) {
			// Refresh personnel table
			getAll();
		} else {
			if ($("#departmentsBtn").hasClass("active")) {
				// Refresh department table
				getAllDepartments();
			} else {
				// Refresh location table
				getAllLocations();
			}
		}

	});

	$("#filterBtn").click(function () {
		// Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location

	});

	$("#addBtn").click(function () {
		// Replicate the logic of the refresh button click to open the add modal for the table that is currently on display

	});

	$("#personnelBtn").click(function () {
		// Call function to refresh personnel table
		getAll();
	});

	$("#departmentsBtn").click(function () {
		// Call function to refresh department table
		getAllDepartments();
	});

	$("#locationsBtn").click(function () {
		// Call function to refresh location table

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


function getAll() {
	$.ajax({
		url: "libs/php/getAll.php",
		type: 'GET',
		dataType: 'json',

		success: function (result) {
			console.log(result.data);
			$.each(result.data, function (index, staffRow) {
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
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-bs-target="#editPersonnelModal" data-id="23">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-bs-target="#deletePersonnelModal" data-id="23">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`));
			});
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
			alert("Something went wrong")
		}
	});
}

function getAllDepartments() {
	$.ajax({
		url: "libs/php/getAllDepartments.php",
		type: 'GET',
		dataType: 'json',

		success: function (result) {
			console.log(result.data);
			$.each(result.data, function (index, deptRow) {
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
                                    data-bs-target="#editDepartmentModal" data-id="1">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="1">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`));
			});
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
			alert("Something went wrong")
		}
	});
}

function getAllLocations() {
	$.ajax({
		url: "libs/php/getAllLocations.php",
		type: 'GET',
		dataType: 'json',

		success: function (result) {
			console.log(result.data);
			$.each(result.data, function (index, locationRow) {
				$('#locationTableBody')
					.append($(`<tr>

                        </tr>`));
			});
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
			alert("Something went wrong")
		}
	});
}




