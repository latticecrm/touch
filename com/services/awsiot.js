
module.exports = function (device, vTagAccess) {
	/** PUBLISH TO AWS IOT **/	

	device.publish('aws/things/mobilephone/shadow/update', JSON.stringify(vTagAccess));
	 
	return "AWS IOT Triggered";
};