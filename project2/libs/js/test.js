$("#searchInp").on("keyup", function () {

    // your code

});

$("#refreshBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {

        // Refresh personnel table

    } else {

        if ($("#departmentsBtn").hasClass("active")) {

            // Refresh department table

        } else {

            // Refresh location table

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

    $("#filterBtn").attr("disabled", false);
    // Call function to refresh presonnel table


});

$("#departmentsBtn").click(function () {

    $("#filterBtn").attr("disabled", true);
    // Call function to refresh department table

});

$("#locationsBtn").click(function () {

    $("#filterBtn").attr("disabled", true);
    // Call function to refresh location table

});

$(".deletePersonnelBtn").click(function () {
    $.ajax({
        url:
            "https://coding.itcareerswitch.co.uk/companydirectory/libs/php/getPersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: $(this).attr("data-id") // Retrieves the data-id attribute from the calling button
        },
        success: function (result) {
            var resultCode = result.status.code;

            if (resultCode == 200) {

                $('#areYouSurePersonnelID').val(result.data.personnel[0].id);
                $("#areYouSurePersonnelName").text(
                    result.data["personnel"][0].firstName +
                    " " +
                    result.data["personnel"][0].lastName
                );

                $("#areYouSurePersonnelModal").modal("show");
            } else {
                $("#areYouSurePersonnelModal .modal-title").replaceWith(
                    "Error retrieving data"
                );
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#deleteEmployeeName .modal-title").replaceWith(
                "Error retrieving data"
            );
        }
    });
});

$(".deleteDepartmentBtn").click(function () {
    $.ajax({
        url:
            "https://coding.itcareerswitch.co.uk/companydirectory/libs/php/checkDepartmentUse.php",
        // checkDepartmentUse.php contains the following SQL
        // -------------------------------------------------
        // SELECT
        //    d.name AS departmentName,
        //    COUNT(p.id) as personnelCount
        // FROM
        //    department d LEFT JOIN 
        //    personnel p ON (p.departmentID = d.id)
        // WHERE d.id  = ?
        // -------------------------------------------------
        type: "POST",
        dataType: "json",
        data: {
            id: $(this).attr("data-id") // Retrieves the data-id attribute from the calling button
        },
        success: function (result) {
            if (result.status.code == 200) {
                if (result.data[0].personnelCount == 0) {
                    $("#areYouSureDeptName").text(result.data[0].departmentName);

                    $("#areYouSureDeleteDepartmentModal").modal("show");
                } else {
                    $("#cantDeleteDeptName").text(result.data[0].departmentName);
                    $("#personnelCount").text(result.data[0].personnelCount);

                    $("#cantDeleteDepartmentModal").modal("show");
                }
            } else {
                $("#exampleModal .modal-title").replaceWith("Error retrieving data");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#exampleModal .modal-title").replaceWith("Error retrieving data");
        }
    });
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {

    $.ajax({
        url:
            "https://coding.itcareerswitch.co.uk/companydirectory/libs/php/getPersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: $(e.relatedTarget).attr("data-id") // Retrieves the data-id attribute from the calling button
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

$("#editPersonnelForm").on("submit", function (e) {

    // Executes when the form button with type="submit" is clicked

    e.preventDefault();

    // AJAX call to save form data

});

$("#areYouSurePersonnelForm").on("submit", function (e) {

    // stop the default browser behviour
    e.preventDefault();

    // AJAX call
});

$("#filterPersonnelByDepartment").change(function () {

    if (this.value > 0) {

        $("#filterPersonnelByLocation").val(0);

        // apply Filter

    }
})

$("#filterPersonnelByLocation").change(function () {

    if (this.value > 0) {

        $("#filterPersonnelByDepartment").val(0);

        // apply Filter

    }
})