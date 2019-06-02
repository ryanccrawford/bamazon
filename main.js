const inquirer = require("inquirer");
var childProcess = require('child_process');
const logo = require('asciiart-logo');
const config = require('./package.json');
console.log(logo(config).render());
setTimeout(mainMenu, 3000)

function mainMenu() {
    console.clear()

    inquirer.prompt([{
        type: "list",
        name: "menu",
        message: "Where to?",
        choices: ["Customer Screen","Manager Screen","Supervisor Screen","Exit"]
    }]).then(function (answer) {
        var script = "bamazon"
        switch (answer.menu) {
            case "Customer Screen":
                script += "Customer.js"
                break
            case "Manager Screen":
                script += "Manager.js"
                break
            case "Supervisor Screen":
                script += "Supervisor.js"
                break
            case "Exit":
                exitApp()
                break
        }
        mainEntry(script, mainMenu)
    })
}
function exitApp(){
    process.exit(0)
}

function mainEntry(_script, callback) {
    var invoked = false
    var process = childProcess.fork(_script)
    process.on('error', function (err) {
        if (invoked) return
        invoked = true
        callback(err)
    })
    process.on('exit', function (code) {
        if (invoked) return
        invoked = true
        var err = code === 0 ? null : new Error(code)
        callback(err)
    })

}