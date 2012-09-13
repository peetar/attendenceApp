var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'peetar',
  password : 'juicy17',
});

connection.connect();

connection.query('SELECT * FROM BSF.members where groupLeader = "leaderb"', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].name);
});

connection.end();