module.exports = function (errorcode, err) {
	/** THIS IS WHERE ADVERTISEMENTS AND ANY OTHER WAIT PAGE OBJECTS WILL BE PLACED **/

	//write code to handle error code and error message

	//return html content for under maintenance
	return "<!DOCTYPE html><html xmlns='http://www.w3.org/1999/xhtml'>" + 
			"<head><title></title><script src='scripts/location.js'></script></head>" + 
			"<body style='text-align:center;'><div style='padding-top:200px'>App Touch Service is Under Maintenance....Please try again later!!!</div>" + 
			"</html>";
};
