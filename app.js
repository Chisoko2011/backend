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

app.listen(port, function() {
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
  res.json({test: true}); 
});

app.post('/putinDB', function (req, res) {
    
   // catch the three variables 
   var text = req.body.text;
   var username = req.body.username;
   var me = req.body.me;
   
   
   // insert into db
  var mysql = require('mysql');

  
 // set up a connection  
  var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test",
  password: "Kawambwa1*"
  });
  
  
  con.connect(function(err) {
      
      
  if (err) throw err;
  console.log("Connected!");
  
  
  var sql = "INSERT INTO chatlog (chattext, username, chattingwith) VALUES ('"+text+"','"+me+"','"+username+"'  )";
  
  console.log(sql);
  
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
});
   
   
   
   
    res.send("saved"); 
});

app.post('/getChatText', function (req, res) {
 
    // connect to db
    var mysql = require('mysql');
   
   // get the username of the person we are talking to
    var username = req.body.username;
  
    // set up a connection  
      var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "test",
      password: "Kawambwa1*"
      });
    
    // loop over the users
    // generate HTML for a list
     var sql = "SELECT * FROM chatlog where chattingWith = '"+username+"';";
     console.log(sql);
     
     
 con.connect(function(err) {
  if (err) throw err;
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    
    
    if(result.length > 0){
        var buffer = '';
        
        
        for(var i=0; i < result.length; i++){
            var oneRecord = result[i]; // put one record into a local variable.
            var oneLine = oneRecord.chattext;
          
           // adding the text onto the buffer variable.
            buffer += oneLine + '\n';
        }
        
        // send back the list of users
        res.send(buffer);
        
        
        
    } else {
        
        res.send("something went wrong");
        
    }
  
});
      
});
   
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
     
 con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM orders_list;", function (err, result, fields) {
    if (err) throw err;    
    
    if(result.length > 0){   
        res.send(result);
    } else {
        res.send("something went wrong");
    }
      }); 
        });
   
});





app.get('/login', function (req, res) {
 
    console.log('un received is ', req.query )
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
  
 con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT *  FROM users WHERE email = '"+un+"' AND password = '"+pw+"';", function (err, result, fields) {
    if (err) throw err;
    
    
    if(result.length > 0){

      con.query("UPDATE users SET logged_in = 1 WHERE email = '" + un + "';", function(err, result, fields) {
        if (err) throw err;
      });
        if (result[0].role_id === '1') {
            res.json({ login: true, role: 'radiographer' });
        } else {
            res.json({ login: true, role: 'hca' });
        }
    } else {
        res.json({ login: false })
    }
   
  });
});
 
})



app.get('/logout', function (req, res) {
 
// catch the variables 
var un = req.query.email;


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

con.connect(function(err) {
if (err) throw err;

    con.query("UPDATE users SET logged_in = 0 WHERE email = '" + un + "';", function(err, result, fields) {
      if (err) throw err;
    });
    res.json({ logout: true});
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

con.connect(function(err) {
if (err) throw err;


    con.query("insert into users (role_id, firstname, lastname, contactnumber, email, password) values ('" + 
    role + "','" + firstname + "','" + lastname + "','" + contact + "','" + email + "','" + password + "');", function(err, result, fields) {
      if (err) throw err;
    });
    res.json({ register: true });
 
});

})






// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});





// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
