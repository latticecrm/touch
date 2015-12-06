module.exports = function (req) {
	var fullUrl = req.protocol + '://' + req.get('host');
	//console.log(fullUrl);

	/** THIS IS WHERE ADVERTISEMENTS AND ANY OTHER WAIT PAGE OBJECTS WILL BE PLACED **/
	return "<!DOCTYPE html><html xmlns='http://www.w3.org/1999/xhtml'>" + 
			"<head><title></title><script src='" + fullUrl + "/location.js'></script></head>" + 
			"<body style='text-align:center;'><div style='padding-top:200px'>Processing!!!</div>" + 
			"</html>"; 
};
