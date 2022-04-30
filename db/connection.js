// connect to db
var mysql = require('mysql');
// set up a connection  
// var connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   database: "test",
//   password: "Kawambwa1*"
// });
var connection = mysql.createConnection({
  host: "jtb9ia3h1pgevwb1.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "phqits8zkml4z4wv",
  database: "pbejm8na3bnea4xe",
  password: "gz1vskee60pfa3am"
});

connection.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected');
})

module.exports = connection;