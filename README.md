# Bamazon
A simple demostration of a CLI amazon style app. This app was made to show my skill in developing a practical backend system that connects to and stores data in a MySQL data base.

This is a command Line app that requires you to have NodeJs, NPM and MySQL installed on your localhost.

Usage:
You must first use the sql files located in the data folder to create the database and table structure. You can also run the other sql scripts which will install test data (Only do this if you do not want to add your own data). Then you will need to create a .env file and inside it put your mysql user name and your mysql password like this

.env file
```
MYSQL_USERNAME=mysql_username_goes_here
MYSQL_PASSWORD=mysql_password_goes_here

```

Once done, simply run npm i to install the required node packages. 

You now should be able to run ```$ node main.js```
to start the app. 

The app has 3 screens:
1. Customer Facing 
2. Manager (For adding new stock and new products)
3. Supervisor, for running reports and adding departments

You can select any of the menu items and the app will take you to the one you select

Features:
- Purchase items by selecting the item and entering the qty
- The stock will update live based on what action is being done.
- Each purchase will recalculate the sales 
- Managers can add new products and add more qty to existing items
- Supervisors can view profits, sales and stock
  
  This application is for deminstartion purposes and is not a completed application. I created it to show that I can create Node applications and have the knowledge to create a more useful system.



