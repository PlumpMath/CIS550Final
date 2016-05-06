// var Promise = require('bluebird');

// Promise.promisifyAll(require('mysql/lib/Connection').prototype);
// Promise.promisifyAll(require('mysql/lib/Pool').prototype);

(function() {
    var mysql = require('promise-mysql');
    var connection;
    
    mysql.createConnection({
        host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
        user     : 'shrekshao',
        password : '12345678',
        database : 'datalake550'
    }).then(function(conn){
        connection = conn;
        
        connection.query('select `value` from vertex where `is_leaf` = TRUE').then(function(rows) {
        for(row in rows) {
            console.log(rows[row]);
        }
            
        });

        console.log('after query');
    });
    
    
    
    
})();





