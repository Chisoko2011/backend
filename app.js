var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');

var dashboardRouter = require('./routes/dashboard');
var app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

const port = 3600;

app.listen(port, function () {
  console.log('App is listening on ' + port);
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);


app.get('/getData', function (req, res) {
  res.send("saved");
});


app.get('/test', function (req, res) {
  res.json({ test: true });
});

app.get('/ordersList', function (req, res) {

  // connect to db
  var mysql = require('mysql');
  // set up a connection  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  // loop over the users
  // generate HTML for a list

  con.connect(function (err) {
    if (err) throw err;
    const query = `SELECT o.patient_mrn, o.firstname, o.lastname, w.name AS ward_location, o.ordered_at, o.hca_assigned, e.name AS exam, a.name AS order_status, r.text AS reason, o.started_at, o.arrived_at 
FROM orders_list o 
JOIN wards w ON o.ward_location_id = w.id
JOIN exams e ON o.exam_id = e.id
JOIN order_status a ON o.order_status_id = a.id
JOIN reasons_for_delay r ON o.reason_id = r.id`
    con.query(query, function (err, result, fields) {
      if (err) throw err;

      if (result.length > 0) {
        res.send(result);
      } else {
        res.send("something went wrong");
      }
    });
  });

});


app.get('/ordersListHca', function (req, res) {

  const hca_id = req.query.hca_id;
  // connect to db
  var mysql = require('mysql');
  // set up a connection  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  // loop over the users
  // generate HTML for a list

  con.connect(function (err) {
    if (err) throw err;
    const query = `SELECT o.patient_mrn, o.firstname, o.lastname, w.name AS ward_location, o.ordered_at, o.hca_assigned, e.name AS exam, a.name AS order_status, r.text AS reason, o.started_at, o.arrived_at 
FROM orders_list o
JOIN wards w ON o.ward_location_id = w.id
JOIN exams e ON o.exam_id = e.id
JOIN order_status a ON o.order_status_id = a.id
JOIN reasons_for_delay r ON o.reason_id = r.id
WHERE o.hca_assigned = ${hca_id}`
    con.query(query, function (err, result, fields) {
      if (err) throw err;

      if (result.length > 0) {
        res.send(result);
      } else {
        res.send("something went wrong");
      }
    });
  });

});



app.get('/login', function (req, res) {

  // catch the variables 
  var un = req.query.userfirstname;
  var pw = req.query.userpassword;

  // put the data in the database
  // pulling in mysql
  var mysql = require('mysql');

  // set up a connection  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  con.connect(function (err) {
    if (err) throw err;
    con.query("SELECT *  FROM users WHERE email = '" + un + "' AND password = '" + pw + "';", function (err, result, fields) {
      if (err) throw err;
      if (result.length > 0) {
        const user = result[0];

        con.query("UPDATE users SET logged_in = 1 WHERE email = '" + un + "';", function (err, result, fields) {
          if (err) throw err;
        });
        if (user.role_id === '1') {
          res.json({ login: true, role: 'radiographer', user_id: user.id });
        } else {
          const hca_status_insert_query = "INSERT INTO hca_status (user_id, name, status) values ('" + user.id + "','" + user.firstname + "',1);";
          con.query(hca_status_insert_query, function (err, result, fields) {
            if (err) throw err;
            res.json({ login: true, role: 'hca', user_id: user.id });
          });
        }
      } else {
        res.json({ login: false })
      }

    });
  });

})



app.get('/logout', function (req, res) {

  // catch the variables 
  var id = req.query.id;


  // put the data in the database
  // pulling in mysql
  var mysql = require('mysql');


  // set up a connection  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  con.connect(function (err) {
    if (err) throw err;

    con.query("UPDATE users SET logged_in = 0 WHERE id = '" + id + "';", function (err, result, fields) {
      if (err) throw err;
    });
    const hca_status_delete_query = "DELETE FROM hca_status WHERE user_id='" + id + "';";
    con.query(hca_status_delete_query, function (err, result, fields) {
      if (err) throw err;
    });
    res.json({ logout: true });
  });

})



app.get('/register', function (req, res) {

  // catch the variables 
  var firstname = req.query.firstName;
  var lastname = req.query.lastName;
  var email = req.query.email;
  var contact = req.query.contact_number;
  var role = req.query.role;
  var password = req.query.password;


  // put the data in the database
  // pulling in mysql
  var mysql = require('mysql');


  // set up a connection  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  con.connect(function (err) {
    if (err) throw err;


    con.query("insert into users (role_id, firstname, lastname, contactnumber, email, password) values ('" +
      role + "','" + firstname + "','" + lastname + "','" + contact + "','" + email + "','" + password + "');", function (err, result, fields) {
        if (err) throw err;
      });
    res.json({ register: true });

  });

})



app.get('/hca_loggedin', function (req, res) {


  // connect to db
  var mysql = require('mysql');
  // set up a connection  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  // loop over the users
  // generate HTML for a list

  con.connect(function (err) {
    if (err) throw err;
    con.query("SELECT *  FROM users WHERE role_id = '2' AND logged_in = 1;", function (err, result, fields) {
      if (err) throw err;

      if (result.length > 0) {
        res.send(result);
      } else {
        res.send("something went wrong");
      }
    });
  });

});


app.get('/hca-assign', function (req, res) {
  var hca_id = req.query.hca_id;
  var mrn = req.query.mrn;

  var mysql = require('mysql');
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  con.connect(function (err) {
    if (err) throw err;

    con.query(`UPDATE orders_list SET hca_assigned = ${hca_id}, order_status_id = 2, started_at = '${new Date()}' WHERE patient_mrn = '${mrn}';`, function (err, result, fields) {
      con.query(`UPDATE hca_status SET STATUS = 0, patient_assigned = ${mrn} WHERE user_id = ${hca_id};`, function (err, result, fields) {
        if (err) throw err;
        res.send({ udated_list: true });
      });
      if (err) throw err;
    });
  });

})


app.get('/order_mark_arrived', function (req, res) {
  var mrn = req.query.mrn;

  var mysql = require('mysql');
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  con.connect(function (err) {
    if (err) throw err;

    con.query(`UPDATE orders_list SET order_status_id = 3, arrived_at = '${new Date()}' WHERE patient_mrn = '${mrn}';`, function (err, result, fields) {
      if (err) throw err;
        res.send({ udated_list: true });
      if (err) throw err;
    });
  });

})



app.get('/add_order', function (req, res) {

  // catch the variables 
  var mrn = req.query.mrn;
  var firstname = req.query.firstName;
  var lastname = req.query.lastName;
  var ward = req.query.ward;
  var exam = req.query.exam;


  // put the data in the database
  // pulling in mysql
  var mysql = require('mysql');


  // set up a connection  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  con.connect(function (err) {
    if (err) throw err;


    con.query("insert into orders_list (patient_mrn, firstname, lastname, ward_location_id , exam_id, ordered_at, order_status_id) values ('" +
      mrn + "','" + firstname + "','" + lastname + "','" + ward + "','" + exam + "','" + new Date() + "',1);", function (err, result, fields) {
        if (err) throw err;
      });
    res.json({ register: true });

  });

})


app.get('/hca_available', function (req, res) {
  // connect to db
  var mysql = require('mysql');
  // set up a connection  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  con.connect(function (err) {
    if (err) throw err;
    const query = `SELECT * FROM hca_status WHERE STATUS = 1;`;
    con.query(query, function (err, result, fields) {
      if (err) throw err;

      if (result.length > 0) {
        res.send(result);
      } else {
        res.send("something went wrong");
      }
    });
  });

});

app.get('/exams', function (req, res) {
  // connect to db
  var mysql = require('mysql');
  // set up a connection  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  con.connect(function (err) {
    if (err) throw err;
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

});


app.get('/wards', function (req, res) {
  // connect to db
  var mysql = require('mysql');
  // set up a connection  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "Kawambwa1*"
  });

  con.connect(function (err) {
    if (err) throw err;
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

});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
