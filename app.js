var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var indexRouter = require('./routes/index');

var dashboardRouter = require('./routes/dashboard');
var app = express();




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

app.use(cors({
    origin: true, // "true" will copy the domain of the request back
                  // to the reply. If you need more control than this
                  // use a function.

    credentials: true, // This MUST be "true" if your endpoint is
                       // authenticated via either a session cookie
                       // or Authorization header. Otherwise the
                       // browser will block the response.

    methods: 'POST,GET,PUT,OPTIONS,DELETE' // Make sure you're not blocking
                                           // pre-flight OPTIONS requests
}));






app.get('/getData', function (req, res) {
    res.send("saved"); 
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



app.post('/getListOfUsers', function (req, res) {
 
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
  con.query("SELECT * FROM login;", function (err, result, fields) {
    if (err) throw err;
    
    
    if(result.length > 0){
        
        
        var buffer = ''; // holds all the HTML to send back.
        
        
        for(var i=0; i < result.length; i++){
            var oneRecord = result[i]; // put one record into a local variable.
            
            console.log(oneRecord);
            
            var oneUser = oneRecord.username;
            buffer += "<li>" + oneUser + '</li> <button onclick="startChat(\''+oneUser+'\')"> Start chat! </button>';
        }
        
        // send back the list of users
        
        res.send(buffer);
        
        
        
    } else {
        
        res.send("something went wrong");
        
    }
 
 
  
      });
      
        });
    
    

  
 
 
   
});





app.post('/login', function (req, res) {
 
  // catch the variables 
  var un = req.body.userfirstname;
  var pw = req.body.userpassword;
  
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
  con.query("SELECT * FROM login WHERE username = '"+un+"' AND userpassword = '"+pw+"';", function (err, result, fields) {
    if (err) throw err;
    
    
    if(result.length > 0){
        res.send("valid");
    } else {
        res.send("no");
    }
 
 
  
    
    
    
  });
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
