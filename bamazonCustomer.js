//Declare 
require("dotenv").config();
const Keys = require("./keys.js");
const inquirer = require("inquirer");
const mysql = require("mysql");
const DATABASE = "bamazon";
const colors = require('colors')
const Table = require('cli-table3');
var cart = [];

//connect to the database
var connection = mysql.createConnection({
    host: 'localhost',
    user: Keys.mysql.username,
    password: Keys.mysql.password,
    database: DATABASE
});

// Entry Function
startApp()

function startApp() {
    console.clear();
    connection.connect();
    cart = [];
    getAllProducts(function (products) {
        displayProducts(products, whichItemToBuy)
    });
}


//Displays products in a table
function displayProducts(products, callback) {
    var table = new Table({
        head: [colors.blue('Id'), colors.blue('Product Name'),
            colors.blue('Department'), colors.blue('Price'),
            colors.blue('Stock Qty')
        ]
    }, {
        colWidths: [3, 35, 35, 20, 5]
    });

    products.products.forEach(function (row) {
        var sl = row.stock_quantity
        var rid = row.item_id
        if (sl > 5) {
            sl = {
                hAlign: 'center',
                content: colors.green(row.stock_quantity)
            }
        } else {
            if (sl === 0) {
                sl = {
                    hAlign: 'center',
                    content: colors.red(row.stock_quantity)
                }
                rid = '-'
            } else {
                sl = {
                    hAlign: 'center',
                    content: colors.red(row.stock_quantity)
                }
            }
        }
        table.push([
            rid,
            colors.green(row.product_name),
            row.department_name,
            {
                hAlign: 'right',
                content: ("$ " + row.price)
            },
            sl
        ])
    })
    console.log(table.toString());
    callback();
}

//Prompt user for item id
function whichItemToBuy() {

    inquirer.prompt(
        [{
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
        }]
    ).then(function (answer) {

        getProduct(answer.item_id, howManyUnitsToBuy);

    })


}

//READ DATABASE FUNCTIONS
function getProduct(id, callback) {

    //console.log("the id that was passed to get product " + id)
    var sql = `SELECT * FROM products WHERE item_id=${id}`
    //console.log("The sql being sent: " + sql)
    connection.query(sql, function (error, results) {
        if (error) throw error;
        debugger;

        if (results.length < 1) {

            getAllProducts(function (products) {
                displayProducts(products, whichItemToBuy)
                console.log("\r\nItem not found. Check the id and try again.")
            });
        } else {
            callback(results[0])
        }
    });
}
//gets all products in the database and then fires the callback parameter
function getAllProducts(callback) {
    connection.query('SELECT * FROM products', function (error, results, fields) {
        if (error) throw error;

        var products = {
            products: results,
            fields: fields
        }
        callback(products);
    });
}
//Gets just the price of an item by item id, also takes in qty to use for calculation of total price paid
function getPrice(id, qty, callback) {
    var sql = `SELECT price, product_name FROM products Where item_id =${id}`
    var item = {
        item: null,
        qty: qty
    }
    cart.push(item)
    connection.query(sql, function (error, results) {
        if (error) throw error;
        var temp = cart.pop()
        temp.item = results[0]
        cart.push(temp)

        callback(processOrder);
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

    connection.query(sql, function (error, results) {
        if (error) throw error;
        getPrice(id, -qty, callback)

    });
}


//prompts user for number of units to purchase
function howManyUnitsToBuy(_itemRow) {
    //   console.log("inside of howmany. This is the passed param ")
    //   console.log(_itemRow)
    var id = _itemRow.item_id
    var stockLevel = _itemRow.stock_quantity
    //   console.log("this is the stock quanity of the item: "+ stockLevel)
    inquirer.prompt(
        [{
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
        }]
    ).then(function (answer) {
        var qtyOrdered = answer.qty
        //      console.log('this is the returned answer ' + qtyOrdered)
        //    console.log("this is the stock passed: " + stockLevel)
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
// chaecks to see if the qty ordered is less than or ='ed whats in stock
function checkQty(number1, number2) {
    return number1 >= number2
}

//this adds or removes stock of an item by id
function buyItem(id, qty, callback) {
    qty = -qty
    var cb = function () {
        updateStock(id, qty, callback)
    }
    updateSales(id, -qty, cb)
}


// calculates & shows the total amount of money spent on the screen
function showPrice() {
    var amount = 0.00
    cart.forEach(function (itemobj) {
        // console.log(itemobj)
        amount += (itemobj.item.price * -parseFloat(itemobj.qty))
    })
    console.log("Your total purchace was $ " + amount)



}
// this ask the customer weather he wants to contiune shopping or to exit
function processOrder() {
    showPrice()
    inquirer.prompt([{
        type: "list",
        name: "continue",
        message: "Continue shopping?",
        defualt: "Yes",
        choices: ['Yes', 'No']
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

// Actually does the database updates and 
function updateSales(id, qtySold, callback) {
    var storedAmount = 0.00
    var sql = `SELECT product_sales, price FROM products WHERE item_id=${id}`

    connection.query(sql, function (error, results) {
        if (error) throw error;
        var totalAmount = results[0].price * qtySold
        storedAmount = results[0].product_sales + totalAmount

        var sql = `UPDATE products SET product_sales=${storedAmount} WHERE item_id=${id}`
        connection.query(sql, function (error, results2) {
            if (error) throw error;

            callback()

        });
    });


}

function exit() {
    connection.end();
    process.exit(0);
}