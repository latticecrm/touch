
var awsIot = require('aws-iot-device-sdk');

module.exports = function (vTagAccess) {
	/** AWS IOT INTERFACE **/
	/*
		Interface with AWS IOT.  
		- Send request to AWS IOT.
		- AWS IOT send to Kensis.

	*/

	var device = awsIot.device({
	   keyPath: './awsCerts/thing-private-key.pem',
	  certPath: './awsCerts/cert.pem',
	    caPath: './awsCerts/rootCA.pem',
	  clientId: 'appaTouchClientId',
	    region: 'us-east-1'
	});

	//Publish message into appamark topic
	device.publish('aws/things/mobilephone/shadow/update', JSON.stringify(vTagAccess));

	// device
	//   .on('connect', function() {
	//     //console.log('connect');
	//     device.subscribe('aws/things/mobilephone/shadow/update');
	    
	//     });

	// device
	//   .on('message', function(topic, payload) {
	//     //console.log('message', topic, payload.toString());
	//     return payload.toString();
	//   });

	return "AWS IOT Triggered";
};