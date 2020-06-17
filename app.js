  
var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');
var router = require('./routes/router');
var app = express();
var http = require('http').Server(app);
var session=require('express-session')({secret:'key',saveUninitialized:false ,resave:true});

app.use(session)


// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set path for static assets
app.use(express.static(path.join(__dirname, 'public')));


// routes
app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.render('error', {status:err.status, message:err.message});
});

http.listen(8080, function(){
    console.log("server started at port 8080...");
})