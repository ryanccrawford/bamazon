require("dotenv").config();
const Keys = require("./keys.js")
const mysql = require("mysql");
const DATABASE = "bamazon";
const connection = mysql.createConnection({
    host: 'localhost',
    user: Keys.mysql.username,
    password: Keys.mysql.password,
    database: DATABASE
});
const inquirer = require("inquirer");
const colors = require('colors')
const Table = require('cli-table3');

console.clear()
showMenu()

function showMenu() {
    inquirer.prompt([{
        type: "list",
        name: "menuChoice",
        choices: ["View Products Sales By Department","Create New Department","Exit"]
    }]).then(function (answer) {
        switch (answer.menuChoice) {
            case "View Products Sales By Department":
                    viewProductSalesByDepartment(showMenu)
                break;
            case "Create New Department":
                    createNewDepartment(showMenu)
                break;
            case "exit":
            default:
                exitApp()
        }

    })
}
function viewProductSalesByDepartment(callback) {
    console.clear()
    var sql = 'SELECT d.department_id, d.department_name, d.over_head_cost,	p.product_sales, (p.product_sales - d.over_head_cost) AS total_profit from products p JOIN departments d ON d.department_name = p.department_name GROUP BY d.department_name'

    connection.query(sql, function (error, results) {
        if (error) throw error;
        displaySalesByDepartment(results, callback)
       
    });
}

function displaySalesByDepartment(results, callback) {

    var table = new Table({
        head: [colors.blue('Id'), colors.blue('Department Name'),
            colors.blue('Cost'), colors.blue('Sales'),
            colors.blue('Profit')
        ]
    }, {
        colWidths: [3, 35, 5, 5, 5]
    });

    results.forEach(function (row) {
        var did = row.department_id
        table.push([
            did,
            colors.green(row.department_name), {
             hAlign: 'right', content: ("$ " + row.over_head_cost)
            },
            {
                hAlign: 'right',
                content: colors.cyan("$ " + row.product_sales)
            },
             {
                 hAlign: 'right',
                 content: colors.cyan("$ " + row.total_profit)
             }
        ])
    })

    console.log(table.toString());
        callback()
    
}

function createNewDepartment(callback) {
    inquirer.prompt([{
        type: "input",
        name: "department",
        message: "Enter New Department Name"
    }]).then(function (answer) {
        insertNewDepartment(answer.department, callback)
    })
}

function insertNewDepartment(department, callback) {
    
     console.clear()
    var sql = `INSERT INTO departments (department_name) VALUES ('${department}')`
    connection.query(sql, function (error, results) {
        if (error) throw error;
         var sql = `SELECT department_id, department_name from departments`
            connection.query(sql, function (error, results2) {
                if (error) throw error;
                console.log("New department has been Created.")
               viewDepartments(results2, callback)
                
            });
            
       

     });

}
function viewDepartments(results, callback) {
    
    var table = new Table({
        head: [colors.blue('Id'), colors.blue('Department Name')
        ]
    }, {
        colWidths: [3, 35]
    });
    console.log(results)
    results.forEach(function (row) {
        var did = row.department_id
        table.push([
            did,
            colors.green(row.department_name)])
    })

    console.log(table.toString());
    callback()
}
function exitApp() {
    connection.end()
    process.exit(0)
}