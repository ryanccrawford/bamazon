require("dotenv").config();
const Keys = require("./keys.js");
const inquirer = require("inquirer");
const mysql = require("mysql");
const DATABASE = "bamazon";
var cart = [];
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : Keys.mysql.username,
  password : Keys.mysql.password,
  database : DATABASE
});
 
startApp()

function startApp() {
    console.clear();
    connection.connect();
    cart = [];
    getAllProducts(function (products) {
       displayProducts(products, whichItemToBuy)
    });
}
 


function displayProducts(products, callback) {
    console.table(products);
    callback();
}

function whichItemToBuy(){
    
    inquirer.prompt(
        [
           {
            type: 'input',
            name: 'item_id',
                message: "Enter the item id of the product you would like to purchase",
                validate: function (value) {
                    var pass = value.match(
                        /\d+/i
                    );
                    if (pass) {
                        return true;
                    }

                    return 'Please enter only digits';
                }
            }
        ]
    ).then(function (answer) {
        console.log("The answer from which item " + answer)
        getProduct(answer.item_id, howManyUnitsToBuy);
       
    })
    
    
}

//READ DATABASE FUNCTIONS
function getProduct(id, callback) {
    
    console.log("the id that was passed to get product " + id)
    var sql = `SELECT * FROM products WHERE item_id=${id}`
    console.log("The sql being sent: " + sql)
    connection.query(sql, function (error, results) {
        if (error) throw error;
        debugger;
        console.log("this is the returned product")
        console.log(results[0])
        callback(results[0])
    });
}
function getAllProducts(callback) {
    connection.query('SELECT * FROM products', function (error, results) {
        if (error) throw error;
        callback(results);
    });
}

//UPDATE DATABASE FUNCTION
//Pass a negitive number to decrease stock and pass a positive number to increase
function updateStock(id, qty, callback) {
  
    var updateEquation = ""
    if (qty < 0) {
        qty = -qty
        updateEquation = `stock_quantity - ${qty}`
    } else if (qty >= 0) {
        updateEquation = `stock_quantity + ${qty}`
    }
    var sql = `UPDATE products SET stock_quantity=${updateEquation} WHERE item_id=${id}`
    console.log(sql)
    console.log(updateEquation)
    connection.query(sql, function (error, results) {
        if (error) throw error;
        var returnResults = {
            result: results[0],
            qtyOrdered: qty
        }
        console.log(returnResults)
        callback(returnResults)
    });
}



function howManyUnitsToBuy(_itemRow) {
    console.log("inside of howmany. This is the passed param ")
    console.log(_itemRow)
    var id = _itemRow.item_id
    var stockLevel = _itemRow.stock_quantity
    console.log("this is the stock quanity of the item: "+ stockLevel)
    inquirer.prompt(
        [
            {
                type: 'input',
                name: 'qty',
                message: `How Many Would You Like?`,
                validate: function (value) {
                    var pass = value.match(
                        /\d+/i
                    );
                    if (pass) {
                       return true;
                    }

                    return `Not a valid number.`;
                }
            }
        ]
    ).then(function (answer) {
        var qtyOrdered = answer.qty
        console.log('this is the returned answer ' + qtyOrdered)
        console.log("this is the stock passed: " + stockLevel)
        if (qtyOrdered === 0) {
            getAllProducts(function (products) {
                displayProducts(products, whichItemToBuy)
            });
        }
        if (checkQty(stockLevel, qtyOrdered)) {
            buyItem(id, qtyOrdered, processOrder)
        } else {
            console.log("Not enough Quantity of that Item.")
            howManyUnitsToBuy(_itemRow)
        }
    })
    
    
}

function checkQty(number1, number2) {
    return number1 > number2
}

function buyItem(id, qty, callback) {
    qty = -qty

    updateStock(id,qty,callback)
    
    
}

function processOrder(_result) {
    console.log(_result)
   var qty = _result.qtyOrdered
    console.log("You just purchased " + qty + ".")
    inquirer.prompt([{
        type: "list",
        name: "continue",
        message: "Continue shopping?",
        defualt: "Yes",
        choices: ['Yes','No']
    }]).then(function (answer) {

        if (answer.continue === 'Yes') {
            getAllProducts(function (products) {
                displayProducts(products, whichItemToBuy)
            });
        } else {
            exit()
        }
    })

}


function exit(){
    connection.end();
    process.exit(0);
}