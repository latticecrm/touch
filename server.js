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
//var crypto = require('crypto');

//local modules
var index_page = require('./com/views/index.js');
var undermaintenance_page = require('./com/views/undermaintenance.js');
var awsiot_service = require('./com/services/awsiot.js');
var db = require('./com/services/db.js');
var query = require('./com/tools/query.js');
var toolbox = require('./com/tools/toolbox.js');
//var appacrypto = require('./com/services/appacrypto.js');

/*-----DECLARATIONS-----*/
//Application Variables 
var app = express();
var PORT = process.env.PORT || 3000;

/*-----USES-----*/
//page level use declarations
app.use(bodyParser.json()); //body-parser 
app.use(express.static(__dirname + '/')); //Store all HTML files in view folder.
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
	if(req.params.serial[0] === "1") {
		res.sendFile(__dirname + '/views/touchlike.html');
	} else {
		res.sendFile(__dirname + '/views/touch.html');
	}
	
});


//LOCATION - GET METHOD FOR pindrop
app.get('/pindrop/:lat/:lng/:serial/:like/:usrdt/:err', function (req, res) {
	//declare local variables
	var vTagAccess = {};
	
	//validate the requests to eliminate attacks

	//Decrypt serial number
	//var serialnumber = appacrypto(req.params.serial);
	var serialnumber = req.params.serial;

	//push the body request post variables into the Tag Access Array Object
	/*
		Type:
		1 = Only Location, Serial number and Date
		2 = Location, Serial number, Date and Like/Displike
		3 = Location, Serial number, Date, Social Net details and Social Net Type
	*/
	if(req.params.like = 'NA') {
		vTagAccess.Type = '1';
	} else {
		vTagAccess.Type = '2';
		vTagAccess.Like = req.params.like;
	}
	
	vTagAccess.lat = req.params.lat;
	vTagAccess.lng = req.params.lng;
	//vTagAccess.serial = req.params.serial;
	vTagAccess.serial = serialnumber;
	vTagAccess.usrdt = req.params.usrdt;
	vTagAccess.msg = req.params.err;
	vTagAccess.Device = toolbox(req,"Device");

	
	//Asyncronized call to push Tag Access to AWS IOT
	var awsiotResponse = awsiot_service(device, vTagAccess);

	//connect to Redshift
	//db.connect();

	//asyncronized call to pull customer URL based on serial number
	var QueryString = query(vTagAccess, "Destination");

	db.query(QueryString, function(err, result) {
        if(err) {
            res.send("/undermaintenance/1000/" + err);
        }
        else {
        	if(result) {
        		if(result.rows.length > 0) {
        			res.send(result.rows[0].destination);
        		} else {
        			res.send("/undermaintenance/1001/No Records Found");
        		}
        	} else {
        		res.send("/undermaintenance/1002/No Result Returned");
        	}
            
        }
    });
	

	//Get Address Details by location (lat and lng)
	vTagAccess.Address = "";
	vTagAccess.PhoneDetails = "";
	vTagAccess.AddressLine = "";
	vTagAccess.City = "";
	vTagAccess.State = "";
	vTagAccess.ZipCode = "";
	vTagAccess.Country = "";
	vTagAccess.FacebookLike = -1;
	vTagAccess.TwitterLike = -1;
	vTagAccess.TagLike = -1;
	vTagAccess.Instagram = "";



	//call to push access details to the Tag Access Base (Redshift)
	var CustQuery = "";

	//Query for product serial
	CustQuery = query(vTagAccess, "Product Serial");
	db.query(CustQuery, function(err, result) {

		if(result) {
    		if(result.rows.length > 0) {
    			vTagAccess.ProductSerialAssociationID = result.rows[0].productserialassociationid;
    			vTagAccess.CustomerID = result.rows[0].customerid;
    			vTagAccess.ProductID = result.rows[0].productid;
    			vTagAccess.serial = vTagAccess.serial;
    			vTagAccess.Status = "Active";
    			vTagAccess.PhoneNumber = -1;
    			vTagAccess.PhoneNON = "";

    			
    			//Query for touch tag
    			var TagQuery = query(vTagAccess, "Tag");
    			db.query(TagQuery, function(err1, result1) {
    				
    				if(result1){
    					if(result1.rows.length > 0) {
    						vTagAccess.TouchTagID = result1.rows[0].touchtagid;
    					} else {
    						//Insert into touchtag if it doesn't already exists
    						var TagInsertQuery = query(vTagAccess, "Insert Tag");
    						db.query(TagInsertQuery);
    					}

    					//Insert into the touch device if it don't exist
    					var DeviceExistsQuery = query(vTagAccess, "Select Device");
    					db.query(DeviceExistsQuery, function(err2, result2) {
    						if(result2) {
    							if(result2.rows.length > 0) {
    								vTagAccess.TouchDeviceID = result2.rows[0].touchdeviceid;
    							} else {
    								var DeviceInsertQuery = query(vTagAccess, "Insert Device");
			    					db.query(DeviceInsertQuery);
								}
    							
		    					//Insert tag access 
		    					var TagBaseInsertQuery = query(vTagAccess, "TagAccess Insert");
		    					db.query(TagBaseInsertQuery);

		    					if(vTagAccess.Status === "SOLD") {
		    						//Update Product Serial Destination List
			    					var SetDestinationQuery = query(vTagAccess, "Set Destination");
			    					db.query(SetDestinationQuery);
		    					}
    						}
    					});
    					
    				}
    			});

    		} 
    	} 
    });


	

	//End Redshift connection
	//db.end();
	
});

//LOCATION - GET METHOD FOR pindrop
app.get('/undermaintenance/:errorcode/:err', function (req, res) {
	//declare local variables
	var vErrorResponseHtml =  undermaintenance_page(req.params.errorcode, req.params.err)
	
	//response redirect to the customers URL
	res.send(vErrorResponseHtml);
	
});

app.get('/sqltest/:serialnumber', function(req,res) {

	 var QueryString = 	"SELECT Destination, DestinationType FROM TouchDestinationList " + 
						"WHERE ProductSerialAssociationID = ( " + 
						"SELECT " + 
						"	(CASE WHEN (SELECT COUNT(1) FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + req.params.serialnumber + "' AND EndSerialNumber >= '" + req.params.serialnumber + "') > 0 THEN " + 
						"	  (SELECT ProductSerialAssociationID FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + req.params.serialnumber + "' AND EndSerialNumber >= '" + req.params.serialnumber + "') " + 
						"	ELSE " + 
						"		1 " + 
						"	END))";


    db.query(QueryString, function(err, result) {
            //done();
            if(err) {
                console.error('error running query', err);
            }
           res.send(result.rows);
        });
   
});

app.listen(PORT, function () {
	console.log("AppaTouch Express server started on " + PORT + " !!!");
});
