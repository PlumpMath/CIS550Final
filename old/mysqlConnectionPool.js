module.exports = {
    MySqlConnectionPool : function () {
        var express = require("express");
        var mysql = require("mysql");
        var app = express();
        
        var pool = mysql.createPool({
            connectionLimit: 10,
            host: 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
            user: 'shrekshao',
            password : '12345678',
            database: 'datalake550'
        });
        
        
    }
};