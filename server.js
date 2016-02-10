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
var request = require('request');
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
var GoogleAPI_KEY = "AIzaSyAz_snMNBdAfra78lrm0XpLWt-YAE4fuSw";

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

/**----GET ALL Products go to LIKE PAGE----*/
var vProductsWithLikeFlag = [];
var emptyData = {};
var DefaultQueryString = query(emptyData, "ProductWithLikeFlag");

db.query(DefaultQueryString, function(err, result) {
    if(result) {
		if(result.rows.length > 0) {
			vProductsWithLikeFlag = result.rows;
		} 
	} 
});

/**This function is called to verify if the current product require a like page or not**/
function inLikeFlagProduct( needle ) {
   for (i in vProductsWithLikeFlag) {
       if (vProductsWithLikeFlag[i].productidentitynumber == needle) return true;
   }
   return false;
}


/*-----REQUESTS, RESPONSES AND FUNCTIONS-----*/
//ROOT - GET METHOD
app.get('/:serial', function (req, res) {
	
	//open index page, this page will collect the location details and call pindrop
	//res.send(index_page(req));
	/////res.render("touch.html");
	//////if(req.params.serial[0] === "1") {
	if(inLikeFlagProduct(req.params.serial.substring(4, 8))) {
		res.sendFile(__dirname + '/views/touchlike.html');
	} else {
		res.sendFile(__dirname + '/views/touch.html');
	}
	
});


//LOCATION - GET METHOD FOR pindrop
app.get('/pindrop/:lat/:lng/:serial/:like/:usrdt/:err', function (req, res) {
	//declare local variables
	var vTagAccess = {};
	var street_number = '';
	var street_name = '';
	
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
	if(req.params.like === 'NA') {
		vTagAccess.Type = '1';
		vTagAccess.TagLike = -1;
	} else {
		vTagAccess.Type = '2';
		vTagAccess.Like = req.params.like;
		if(req.params.like === 'Like' || req.params.like === 1) {
			vTagAccess.TagLike = 1;
		} else {
			vTagAccess.TagLike = 0;
		}
		
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

	db.query(QueryString, [vTagAccess.usrdt, vTagAccess.serial],  function(err, result) {
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
	vTagAccess.Instagram = "";



	//call to push access details to the Tag Access Base (Redshift)
	var CustQuery = "";

	//Query for product serial
	CustQuery = query(vTagAccess, "Product Serial");
	db.query(CustQuery, [vTagAccess.serial], function(err, result) {
		if(result) {
    		if(result.rows.length > 0) {
    			vTagAccess.ProductSerialAssociationID = result.rows[0].productserialassociationid;
    			vTagAccess.CustomerID = result.rows[0].customerid;
    			vTagAccess.ProductID = result.rows[0].productid;
    			vTagAccess.serial = vTagAccess.serial;
    			vTagAccess.Status = "Active";
    			vTagAccess.PhoneNumber = -1;
    			vTagAccess.PhoneNON = "";

    			//request google api to get the address based on lat and lng
    			var GoogleApiAddress = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + vTagAccess.lat + "," + vTagAccess.lng + "&key=" + GoogleAPI_KEY + "";
    			
    			request({
						url: GoogleApiAddress,
						json: true
					}, function (error, response, body) {
						if (error) {
							vTagAccess.Address = "";
							vTagAccess.AddressLine = "";
							vTagAccess.City = "";
							vTagAccess.State = "";
							vTagAccess.ZipCode = "";
							vTagAccess.Country = "";
						} else if (body.results.length === 0) {
							vTagAccess.Address = "";
							vTagAccess.AddressLine = "";
							vTagAccess.City = "";
							vTagAccess.State = "";
							vTagAccess.ZipCode = "";
							vTagAccess.Country = "";
						} else {
							//////console.log(body.results.length);
							vTagAccess.Address = body.results[0].formatted_address;
							for(arrCount = 0; arrCount < body.results[0].address_components.length; arrCount++) {
								if (body.results[0].address_components[arrCount].types[0].indexOf("street_number") > -1) {
									street_number = body.results[0].address_components[arrCount].short_name;
								} else if (body.results[0].address_components[arrCount].types[0].indexOf("route") > -1) {
									street_name = body.results[0].address_components[arrCount].short_name;
								} else if (body.results[0].address_components[arrCount].types[0].indexOf("locality") > -1) {
									vTagAccess.City = body.results[0].address_components[arrCount].short_name;
								} else if (body.results[0].address_components[arrCount].types[0].indexOf("administrative_area_level_1") > -1) {
									vTagAccess.State = body.results[0].address_components[arrCount].short_name;
								} else if (body.results[0].address_components[arrCount].types[0].indexOf("country") > -1) {
									vTagAccess.Country = body.results[0].address_components[arrCount].short_name;
								} else if (body.results[0].address_components[arrCount].types[0].indexOf("postal_code") > -1) {
									vTagAccess.ZipCode = body.results[0].address_components[arrCount].short_name;
								}
							}
							vTagAccess.AddressLine = street_number + " " + street_name;
						}

						//Query for touch tag
		    			var TagQuery = query(vTagAccess, "Tag");
		    			db.query(TagQuery, [vTagAccess.serial, vTagAccess.CustomerID, vTagAccess.ProductID], function(err1, result1) {
		    				
		    				if(result1){
		    					if(result1.rows.length > 0) {
		    						vTagAccess.TouchTagID = result1.rows[0].touchtagid;
		    					} else {
		    						//Insert into touchtag if it doesn't already exists
		    						var TagInsertQuery = query(vTagAccess, "Insert Tag");
		    						db.query(TagInsertQuery, [vTagAccess.serial, vTagAccess.CustomerID, vTagAccess.ProductID, vTagAccess.Status]);
		    					}

		    					//Insert into the touch device if it don't exist
		    					var DeviceExistsQuery = query(vTagAccess, "Select Device");
		    					db.query(DeviceExistsQuery, [vTagAccess.Device, vTagAccess.PhoneNumber], function(err2, result2) {
		    						if(result2) {
		    							if(result2.rows.length > 0) {
		    								vTagAccess.TouchDeviceID = result2.rows[0].touchdeviceid;
		    							} else {
		    								var DeviceInsertQuery = query(vTagAccess, "Insert Device");
					    					db.query(DeviceInsertQuery, [vTagAccess.Device, vTagAccess.PhoneNumber]);
										}
		    							
				    					//Insert tag access 
				    					var TagBaseInsertQuery = query(vTagAccess, "TagAccess Insert");
				    					db.query(TagBaseInsertQuery, [
				    						vTagAccess.Device,
				    						vTagAccess.PhoneNumber,
				    						vTagAccess.ProductSerialAssociationID,
				    						vTagAccess.serial,
				    						vTagAccess.CustomerID,
				    						vTagAccess.ProductID,
				    						vTagAccess.PhoneNON,
				    						vTagAccess.Address,
				    						vTagAccess.lat,
				    						vTagAccess.lng,
				    						vTagAccess.PhoneDetails,
				    						vTagAccess.AddressLine,
				    						vTagAccess.City,
				    						vTagAccess.State,
				    						vTagAccess.ZipCode,
				    						vTagAccess.Country,
				    						vTagAccess.FacebookLike,
				    						vTagAccess.TwitterLike,
				    						vTagAccess.Instagram,
				    						vTagAccess.TagLike
				    						]);

				    					if(vTagAccess.Status === "SOLD") {
				    						//Update Product Serial Destination List
					    					var SetDestinationQuery = query(vTagAccess, "Set Destination");
					    					db.query(SetDestinationQuery, [vTagAccess.usrdt, vTagAccess.serial]);
				    					}
		    						}
		    					});
		    					
		    				}
		    			});									

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
						"	(CASE WHEN (SELECT COUNT(1) FROM ProductSerialAssociation WHERE StartSerialNumber <= $1 AND EndSerialNumber >= $1) > 0 THEN " + 
						"	  (SELECT ProductSerialAssociationID FROM ProductSerialAssociation WHERE StartSerialNumber <= $1 AND EndSerialNumber >= $1) " + 
						"	ELSE " + 
						"		1 " + 
						"	END))";


    db.query(QueryString, [req.params.serialnumber], function(err, result) {
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
