var latitude = 0;
var longitude = 0;
var err = '';
var currentURL = '';
var formObj;

function getLocation() {
    try{
        //Dummy one, which will result in a working next statement.
        //navigator.geolocation.getCurrentPosition(function () {}, function () {}, {timeout: 5000});
        // Get location no more than 10 minutes old. 600000 ms = 10 minutes.
        //navigator.geolocation.getCurrentPosition(showLocation, showError, { enableHighAccuracy: true, maximumAge: 600000, timeout: 5000 });
        navigator.geolocation.getCurrentPosition(showLocation, showError, { maximumAge: 600000, timeout: 5000 });
    }
    catch(err)
    {
         try{
                // Get location no more than 10 minutes old. 600000 ms = 10 minutes.
                navigator.geolocation.getCurrentPosition(showLocation, showError, { maximumAge: 600000, timeout: 5000 });
            }
            catch(err)
            {
                //Call error or exception process
                callAppaUndermaintenanceService(6502, err.message);
            }
    }
    
}

function callAppaUndermaintenanceService(errorcode, err) {
    /** HANDLE ERROR OR EXCEPTION HERE **/
    window.location.href = "undermaintenance/" + errorcode + "/" + err;
}

function callAppaPindropService(lat, lng, err) {
    /** Appamark Pindrop service is called using XMLHttpRequest
        Currently using GET Method.  Reason to use GET, having issue sending application/json as content-type for POST
        Future convert this to use POST Method
     **/
    try {
        var http = new XMLHttpRequest();

        var appaServiceURL = window.location.protocol + "//" + window.location.host + "/pindrop/"; //Pindrop URL
        var serial = getQueryParamValue2(); //Get serial number from index URL
        var usrdt = getCurrentDateTime(); //Get current date time
        
        //open http connection
        http.open("GET", appaServiceURL + lat + "/" + lng + "/" + serial + "/NA/" + usrdt + "/" + err, true);

        //state change callback function to capture the connection state change.  
        http.onreadystatechange = function() {
           
           //when state = response recieved capture the response
            if (http.readyState == 4 && http.status == 200) {
                //expecting the response to be URL, redirect to the response URL
                /** ADD VALIDATION TO AVOID ANY ATTACKS **/
                window.location=http.responseText;
            }
            
        }
        //send request
        http.send();
    }
   catch (err) {
        //Call error or exception process
        callAppaUndermaintenanceService(6504, err.message);
   }
}

function showError(error) {
    try{

        switch (error.code) {
            case error.PERMISSION_DENIED:
                err = "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                err = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                err = "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
                err = "An unknown error occurred.";
                break;
            default:
                err = "Unknown error";
                break;
        }

        //call Appamark Service Touch Service
        if (position) {
            if(position.coords) {
                callAppaPindropService(position.coords.latitude, position.coords.longitude, err);
            } else {
                callAppaPindropService(0, 0, "");
            }
        } else {
            callAppaPindropService(0, 0, "");
        }


   }
   catch (err) {
        //Call error or exception process
        callAppaUndermaintenanceService(6503, err.message);
   }
}

function getParamVaue(name){
    //get parameter value based on key using REGEX
    if(name=(new RegExp('[?&]'+ encodeURIComponent(name) +'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

function getQueryParamValue(Key) {
    //get parameter value based on key using split
    var url = window.location.href;
    KeysValues = url.split(/[\?&]+/);
    for (i = 0; i < KeysValues.length; i++) {
        KeyValue = KeysValues[i].split("=");
        if (KeyValue[0] == Key) {
            return KeyValue[1];
        }
    }
}

function getQueryParamValue2() {
    //get last parameter value
    var url = window.location.href;
    KeysValues = url.split("/");
    /** ADD VALIDATION TO AVOID ANY ATTACKS **/
    return KeysValues[KeysValues.length - 1];
    
}

function getCurrentDateTime() {
    //GET Current Date
    var currentdate = new Date();
    return "" + currentdate.getFullYear() + "-"
            + (currentdate.getMonth() + 1) + "-"
            + currentdate.getDate() + "_"
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
    
}

function showLocation(position) {
    
    //call Appamark Service Touch Service
    callAppaPindropService(position.coords.latitude, position.coords.longitude, "NA");
}

if (navigator.geolocation) {
    //Get the user location.
    getLocation();
} else {
    //call Appamark Service Touch Service
    callAppaPindropService(0, 0, "Not Supported");
    
}

