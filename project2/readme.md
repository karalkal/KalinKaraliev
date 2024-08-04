# Company directory
## - a basic CRUD application connected to a relataional Database. 
### It's structure can be ilustrated by the following query using LEFT JOIN:
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
The application allows for the addition, update and deletion of entries in all tables.


## START UP NOTES

start XAMPP in ubuntu:  
```sudo /opt/lampp/manager-linux-x64.run```  

change ownership of htdocs folder:
```sudo chown -R username:username /opt/lampp/htdocs```

stop apache server and start xampp in terminal:  
```sudo /etc/init.d/apache2 stop```
```sudo /opt/lampp/lampp start```

## SEARCH
- Search sends new query upon keyup event
- Found results are rendered using the same function which displays all staff.
- The query in template PHP routine was written as: 
```
SELECT ....... `d`.`name` AS `departmentName` ........ `l`.`name` AS `locationName`
```
- But since `renderStaffTable(staff)` expects data like staffRow.department and staffRow.location I have renamed alies locationName and departmentName in query
- TODO: I have my reservations about this approach. Firstly, requests are too numerous. Why can't we just filter the data we already have at our disposal? Secondly, this more or less makes the getAll.php routine redundant as it would return the same results as when searching with empty search term.  

## CREATE
- To ensure consistency in DB new staff members cannot be created "on the fly", i.e. the department must already exists in DB and be present in the `<select>` container. The same rule applies to creating departments - the location needs to already be in the DB.  
- Names are title-ized (with the exception of words like "and", "de" etc., e.g. "Research and Dev" or "Robert de Niro") before being sent to PHP routes/DB.  
- Sorting objects by name of property, i.e. departments sorted alphabetically when cerating staff

## DELETE
- Before any deletions are made the user interface asks for a confirmation and in cases where there are dependent entries in related tables warn the user that a deletion is not allowed (i.e. where a department has personnel assigned to it or where a location has departments assigned to it). In other words no CASCADE is allowed.


