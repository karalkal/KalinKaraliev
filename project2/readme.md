start XAMPP in ubuntu:  
```sudo /opt/lampp/manager-linux-x64.run```  

change ownership of htdocs folder:
```sudo chown -R username:username /opt/lampp/htdocs```

stop apache server and start xampp in terminal:  
```sudo /etc/init.d/apache2 stop```
```sudo /opt/lampp/lampp start```

# CREATE
- To ensure consistency in DB new staff members cannot be created "on the fly", i.e. the department must already exists in DB and be present in the <select> container. The same rule applies to creating departments - the location needs to already be in the DB.  
- Names are title-ized (with the exception of words like "and", "de" etc., e.g. "Research and Dev" or "Robert de Niro") before being sent to PHP routes/DB.  
- Sorting objects by name of property, i.e. departments sorted alphabetically when cerating staff
