var mysql = require('mysql');
var connection = mysql.createConnection({
    host : '34.64.123.43',
    port : '3306',
    user : 'root',
    password : 'gsb96!@',
    database : 'designer'
});

connection.connect();

connection.query('SELECT * FROM posts', function(err, results, fields){
    if(err){
        console.log(err)
    }
    console.log(results);
});

connection.end();