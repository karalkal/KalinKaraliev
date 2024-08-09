# <p style="text-align: center;">Company directory</p>
- A basic CRUD application connected to a relataional database 
- Built with  PHP, MySQLMariaDB, Jquery & JavaScript 
---   
---   
---   
---   

## DB structure
The DB consists of 3 tables: personnel, department and location. The location PKs **can** be allocated as FKs for departments, the same applies for departments/personnel relation.  
**But no Foreign Key constraint is actually present in the original sql script**.  
In other words each staff member **can** be assigned to a department and each department can be assigned to a location.  
However at DB level there is no requirement for the locationID in department or departmentID in personnel to be actually corresponding to existing PKs in the relevant tables.  
**Something replicating PK - FK relation must therefore be implemented in the our front end app by using a`<select>` element with predefined values.**  
There is also no requirement for uniqueness of names when INSERT or UPDATE.  
At DB level it is also possible to DELETE location if a department is "linked" to it, again because no FK constraint is implemented.  
**To protect the integrity of our data and not allow the user to compromise it by deleting records with dependencies we will carry out verification at our front end.**  
The DB structure/columns can actually be best illustrated by the following query using LEFT JOIN:
```
SELECT p.lastName,
p.firstName,
p.jobTitle,
p.email,
d.name as department,
l.name as location
FROM personnel p
LEFT JOIN department d ON (d.id = p.departmentID)
LEFT JOIN location l ON (l.id = d.locationID)
ORDER BY p.lastName, p.firstName, d.name, l.name
```

## Notes on Functionality
- The application allows for the addition, update and deletion of entries in all tables.
- While the app loads initially or awaits response from the backend a spinner will be rendered.
- Upon initial render the app will gather data from all 3 tables. By default the personnel pane will be displayed. 
- Switching the menu tabs will display the relevant tables/panes, each time sending a new request and displaying updated data.
- Clicking the *update* button will do the same for the currently opened tab (table)
- The *filter* button allows filtering staff by location or departments using `<select>` dropdown menu. When an `<option>` from either menu is selected a filtered personnel table will be rendered regardless of the currently active table.
- The *search* field will send new requests upon keyup events searching strings LIKE the user input in personnel (firstName, lastName, email, jobTitle) + dept. name + loc. name. Again, an updated personnel table will be rendered regardless of the currently active one.
- When creating (or updating) data specialised functions will title-ize name strings, lowercase and validate emails etc. 
- Department location can only be picked from existing, previously created entries in location table. Similarly, staff department can be picked from existong location.
- Deleting items will work only if the integrity of the DB is not compromised, e.g. a location cannot be deleted if a departments is linked to it.
- The Update functionality is very similar to Create but I have decided to make personnel names readonly as the idea of being able to rename staff does not seem particularly logical in any sort of organization.

## Notes on running the app locally with XAMPP in Ubuntu

- start XAMPP in ubuntu:  
```sudo /opt/lampp/manager-linux-x64.run```  

- change ownership of htdocs folder:
```sudo chown -R username:username /opt/lampp/htdocs```

- paste/start developing app in this folder

- stop apache server and start xampp in terminal:  
```sudo /etc/init.d/apache2 stop```
```sudo /opt/lampp/lampp start```

- access at localhost

## Notes on Implementation

### CREATE
- To ensure consistency in DB new staff members cannot be created "on the fly", i.e. the department must already exists in DB and be present in the `<select>` container. The same rule applies to creating departments - the location needs to already be in the DB.  
- Names are title-ized (with the exception of words like "and", "de" etc., e.g. "Research and Dev" or "Robert de Niro") before being sent to relevant PHP routes/DB.  
- Options in `<select>` containers are sorted alphabetically.

### DELETE
- The id of the item to be deleted is obtained from `$(e.currentTarget).attr("data-id");`
- Before any deletions are made the user interface asks for a confirmation and in cases where there are dependent entries in related tables an error message will inform the user that a deletion is not allowed (i.e. where a department has personnel assigned to it or where a location has departments assigned to it). In other words we try to replicate something restricting cascade delete when foreign keys are present.

### UPDATE
- Update implementation is combining elements Create and Delete.
- Users' first names and last names are readonly and cannot be updated.
- When updating department current location will be displayed first in dropdown menu, followed by `allDeptsExcludingCurrent`. The same applies for departments for staff to be updated.

### FILTER
- Upon click of the filtering button the filterStaff() function will display a modal with 2 `<select>` containers: `departmentsSelect` and `locationsSelect`. 
- When an option of one of them is selected the other `<select>` will be hidden.
- We capture tha value of the selected option with `$(this).find("option:selected");` and sort the staff array by departmentId or locationId. 

### SEARCH
- Search sends new query upon keyup event.
- Found results are rendered using the same function which displays all staff.
- The query in template PHP routine was written as: 
```
SELECT ....... `d`.`name` AS `departmentName` ........ `l`.`name` AS `locationName`
```
- But since `renderStaffTable(staff)` expects data like staffRow.department and staffRow.location I have renamed alias locationName and departmentName in the original PHP file.
- Search string will be reset to "" once menu button for all staff is clicked.
- TODO: I have my reservations about this approach. Firstly, requests are too numerous. Why can't we just filter the data we already have at our disposal? Secondly, this more or less makes the getAll.php routine redundant as the search function would return the same results when "searching" with empty string as search term.  
