require("dotenv").config();
const inquirer = require("inquirer");
const mysql = require("mysql");

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'secret',
  database : 'my_db'
});
 
connection.connect();
 
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
 
connection.end();






function displayProducts(){
    
    
    
    
}


function whichItemToBuy(){
    
    
    
    
}


function howManyUnitsToBuy(){
    
    
    
}


function buyItem(itemId){
    
    
    
}