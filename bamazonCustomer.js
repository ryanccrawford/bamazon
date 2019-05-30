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
    getAllProducts(function (prducts) {
        console.log(prducts[0].RowDataPacket)
        var test = prducts.RowDataPacket
        console.log(test)
        var itemRow = prducts[0].RowDataPacket
        console.log(itemRow)
        console.log(itemRow);
       displayProducts(prducts, whichItemToBuy)
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
        
        getProduct(answer.item_id, howManyUnitsToBuy);
       
    })
    
    
}

//READ DATABASE FUNCTIONS
function getProduct(id, callback) {
    var id = parseInt(id)
    console.log(id)
    connection.query('SELECT * FROM products WHERE item_id=?', [id], function (error, results) {
        if (error) throw error;
        debugger;
        callback(results)
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
    var qty = parseInt(qty)
    var updateEquation = ""
    if (qty < 0) {
        updateEquation = `stock_quantity-${qty}`
    } else if (qty >= 0) {
        updateEquation = `stock_quantity+${qty}`
    }
    connection.query(`UPDATE products SET stock_quantity=${updateEquation} WHERE item_id=?`, [id], function (error, results) {
        if (error) throw error;
        console.log(results[0].RowDataPacket);
        var itemRow = results[0].RowDataPacket
        callback(itemRow)
    });
}



function howManyUnitsToBuy(_itemRow) {
    console.log(_itemRow)
    var item = _itemRow
    var stockLevel = item.stock_quantity
    inquirer.prompt(
        [
            {
                type: 'input',
                name: 'qty',
                message: `How Many ${item.name} Would You Like, there are ${stockLevel} in stock`,
                validate: function (value) {
                    var pass = value.match(
                        /\d+/i
                    );
                    if (pass) {
                        if (parseInt(value) <= parseInt(stockLevel))
                        return true;
                    }

                    return `Not enough in stock. Please enter ${stockLevel} or less.`;
                }
            }
        ]
    ).then(function (answer) {
        var qtyOrdered = answer.qty
        if (checkQty(stockLevel, qtyOrdered)) {
            buyItem(stockLevel, qtyOrdered, processOrder)
        }
    })
    
    
}

function checkQty(number1, number2) {
    return number1 > number2
}

function buyItem(id, qty, callback){
    console.log("Item database qty update gos here")
    
    
}

function processOrder(_result) {


}


function exit(){
    connection.end();
    process.exit(0);
}