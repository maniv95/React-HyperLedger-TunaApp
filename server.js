var express       = require('express');        
var app           = express();               
var bodyParser    = require('body-parser');
var http          = require('http')
var fs            = require('fs');
var Fabric_Client = require('fabric-client');
var path          = require('path');
var util          = require('util');
var os            = require('os');
var FormData      = require('form-data');
var cors          = require('cors')
var routes        = require('./routes');

app.use(bodyParser.json({limit:"10mb"}));
app.use(bodyParser.urlencoded({limit:"10mb", extended:true, parameterLimit:500}))
app.use(cors())
app.use('/api/',routes.routes);

app.use(function(req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var port = process.env.PORT || 8080;
app.listen(port,function(){
  console.log("Server Live on port: " + port);
});

