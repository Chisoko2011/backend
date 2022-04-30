
var con = require('../db/connection');
module.exports = function(app){
  
app.get('/exams', function (req, res) {

      const query = `SELECT * FROM exams;`;
      con.query(query, function (err, result, fields) {
        if (err) throw err;
  
        if (result.length > 0) {
          res.send(result);
        } else {
          res.send("something went wrong");
        }
      });
  
  });
  
  
  app.get('/wards', function (req, res) {
  
      const query = `SELECT * FROM wards;`;
      con.query(query, function (err, result, fields) {
        if (err) throw err;
  
        if (result.length > 0) {
          res.send(result);
        } else {
          res.send("something went wrong");
        }
      });
  
  });
  
  app.get('/reasons', function (req, res) {
  
      const query = `SELECT * FROM reasons_for_delay;`;
      con.query(query, function (err, result, fields) {
        if (err) throw err;
  
        if (result.length > 0) {
          res.send(result);
        } else {
          res.send("something went wrong");
        }
      });
  
  });
}