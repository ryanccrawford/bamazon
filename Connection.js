

function Connection() {
       
        this.mysql = require("mysql");
        this.DATABASE = "bamazon";
        this.connection = this.mysql.createConnection({
            host: 'localhost',
            user: Keys.mysql.username,
            password: Keys.mysql.password,
            database: DATABASE
        });
    

}

module.exports = {
    connection: Connection
}