/** GENERIC Tool SERVICE ** 
	PARAMETERS:
		someobjects =  object
		type = type of call
 **/
module.exports = function (obj, type) {

	var UserAgent = obj.headers["user-agent"];
	if (type === "Device") {
		if (UserAgent.indexOf("iPhone") > -1)
	    {
	        return "iPhone";
	    }
	    else if (UserAgent.indexOf("iPad") > -1)
	    {
	        return "iPad";
	    }
	    else if (UserAgent.indexOf("Android") > -1)
	    {
	        return "Android";
	    }
	    else if (UserAgent.indexOf("Windows") > -1)
	    {
	        return "Windows";
	    }
	    else if (UserAgent.indexOf("Macintosh") > -1)
	    {
	        return "Mac";
	    }
	    else 
	    {
	    	return "Unknown";
	    }

		
	} else {
		return "";
	}

	
};