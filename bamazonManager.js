require("dotenv").config();
const Keys = require("./keys.js")
const mysql = require("mysql");
const DATABASE = "bamazon";
const inquirer = require("inquirer");
const colors = require('colors')
const Table = require('cli-table3');
var holder = []
var cart = []

//connects to the database
const connection = mysql.createConnection({
    host: 'localhost',
    user: Keys.mysql.username,
    password: Keys.mysql.password,
    database: DATABASE
});



//Mian entru function
startApp()


function startApp() {
    console.clear();
    console.log("Welcome to BMS (Bamazon Managment System)")
    connection.connect();
    holder = [];
    clearScreen()
}
//
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

            } else {
                sl = {
                    hAlign: 'center',
                    content: colors.yellow(row.stock_quantity)
                }
            }
        }
        table.push([
            rid,
            colors.green(row.product_name),
            row.department_name,
            {
                hAlign: 'right',
                content: colors.cyan("$ " + row.price)
            },
            sl
        ])
    })

    console.log(table.toString());

    callback();
}

function showMenu() {


    inquirer.prompt(
        [{
            type: 'list',
            name: 'doWhat',
            message: "Select a Task",
            choices: ["View All Products", "View Low Inventory", "Add Inventory", "Add New Products", "Exit"],
            defualt: "View All Products"
        }]
    ).then(function (answer) {
        switch (answer.doWhat) {
            case "View All Products":
                viewAll()
                break
            case "View Low Inventory":
                viewLow()
                break
            case "Add Inventory":
                AddInv()
                break
            case "Add New Products":
                AddNew()
                break
            default:
                exit()
                break
        }
    })
}

function viewAll() {

    getAllProducts(display)

}

function display(products) {
    console.clear()
    displayProducts(products, clearScreen)
}

function clearScreen() {
    showMenu()
}

function viewLow() {
    getLowInvPro(display)
}

function AddInv() {

    inquirer.prompt(
        [{
            type: 'input',
            name: 'id',
            message: `What item 'Id' do you want to update?`,
            validate: function (value) {
                var pass = value.match(
                    /\d+/i
                );
                if (pass) {
                    return true;
                }

                return `Not a valid number.`;
            }
        }, {
            type: 'input',
            name: 'amount',
            message: `How many do you want to add?`,
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
        var callback = function () {
            getAllProducts(display)
        }
        updateStock(answer.id, answer.amount, callback)
    })
}

function AddNew() {
    console.log("Adding New Product")
    inquirer.prompt(
        [{
            type: 'input',
            name: 'product_name',
            message: `Enter the Name of the New Product?`
        }, {
            type: 'input',
            name: 'department_name',
            message: `Enter the Product Department / Category`
        }, {
            type: 'input',
            name: 'price',
            message: `Enter the Product Price`,
            validate: function (value) {
                var pass = value.match(
                    /\d+\.\d{2}/i
                );
                if (pass) {
                    return true;
                }

                return `Enter a price like this 0.00`;
            }
        }, {
            type: 'input',
            name: 'stock_quantity',
            message: `Enter the Product Qty on Hand`,
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
        var callback = function () {
            getAllProducts(display)
        }
        insertNew(answer, callback)
    })

}

function insertNew(answerObj, callback) {

    var set = `('${answerObj.product_name}', '${answerObj.department_name}', ${answerObj.price}, ${answerObj.stock_quantity})`
    var sql = `INSERT INTO products (product_name, department_name,price,stock_quantity) VALUES ${set}`

    connection.query(sql, function (error, results) {
        if (error) throw error;
        callback()

    });
}
//READ DATABASE FUNCTIONS
function getLowInvPro(callback) {
    connection.query('SELECT * FROM products where stock_quantity < 5', function (error, results, fields) {
        if (error) throw error;

        var products = {
            products: results,
            fields: fields
        }
        callback(products);
    });
}

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
//UPDATE DATABASE FUNCTION
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

        callback()

    });
}

function exit() {
    inquirer.prompt([{
        type: "list",
        name: "continue",
        message: "Are you Sure you want to exit?",
        defualt: "Yes",
        choices: ['Yes', 'No']
    }]).then(function (answer) {

        if (answer.continue === 'Yes') {

            connection.end();
            process.exit(0);
        } else {
            clearScreen()
        }
    })

}