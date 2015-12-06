/********************************************************************************************************************************************
---------------------------------------------------------------------------------------------------------------------------------------------
Company: Appamark Touch 
File: server.js
Description: 
NodeJS Starting Point Server.  
Hosts URL Service information.  
Appamark Touch products main landing file.
Web page/service configurations are done here. 
FYI -- appatouch is deployed to AWS Beanstalk and Heroku
---------------------------------------------------------------------------------------------------------------------------------------------

-------------Update Log----------------------------------------------------------------------------------------------------------------------
Version | When | Who | What :
----------------------------
1.0 | 11/26/2015 | SR | server.js file created
---------------------------------------------------------------------------------------------------------------------------------------------
********************************************************************************************************************************************/
/*-----INCLUDES OR REQUIRES-----*/
var express = require("express");
var bodyParser = require("body-parser");
var _= require("underscore");
var awsIot = require('aws-iot-device-sdk');

//local modules
var index_page = require('./com/views/index.js');
var undermaintenance_page = require('./com/views/undermaintenance.js');
var awsiot_service = require('./com/services/awsiot.js');


/*-----DECLARATIONS-----*/
//Application Variables 
var app = express();
var PORT = process.env.PORT || 3000;

/*-----USES-----*/
//page level use declarations
app.use(bodyParser.json()); //body-parser 
app.use(express.static(__dirname + '/views')); //Store all HTML files in view folder.
app.use(express.static(__dirname + '/awsCerts')); //AWS Certificates.

/**-----CONNECT TO AWS IOT-----**/
var device = awsIot.device({
	   keyPath: './awsCerts/thing-private-key.pem',
	  certPath: './awsCerts/cert.pem',
	    caPath: './awsCerts/rootCA.pem',
	  clientId: 'AppamarkTouch',
	    region: 'us-east-1'
	});

/*-----REQUESTS, RESPONSES AND FUNCTIONS-----*/
//ROOT - GET METHOD
app.get('/:serial', function (req, res) {
	
	//open index page, this page will collect the location details and call pindrop
	//res.send(index_page(req));
	/////res.render("touch.html");
	res.sendFile(__dirname + '/views/touch.html');
});


//LOCATION - GET METHOD FOR pindrop
app.get('/pindrop/:lat/:lng/:serial/:usrdt/:err', function (req, res) {
	//declare local variables
	var vTagAccess = {};
	var vCustomerURL = "";

	//validate the requests to eliminate attacks

	
	//push the body request post variables into the Tag Access Array Object
	vTagAccess.lat = req.params.lat;
	vTagAccess.lng = req.params.lng;
	vTagAccess.serial = req.params.serial;
	vTagAccess.usrdt = req.params.usrdt;
	vTagAccess.msg = req.params.err;

	//Asyncronized call to push Tag Access to AWS IOT
	var awsiotResponse = awsiot_service(device, vTagAccess);

	//asyncronized call to pull customer URL based on serial number

	vCustomerURL = "http://www.google.com"; //Assign the customer url here...

	//response redirect to the customers URL
	res.send(vCustomerURL);
	
});

//LOCATION - GET METHOD FOR pindrop
app.get('/undermaintenance/:errorcode/:err', function (req, res) {
	//declare local variables
	var vErrorResponseHtml =  undermaintenance_page(req.params.errorcode, req.params.err)
	
	//response redirect to the customers URL
	res.send(vErrorResponseHtml);
	
});

app.listen(PORT, function () {
	console.log("AppaTouch Express server started on " + PORT + " !!!");
});
