/** GENERIC QUERY SERVICE ** 
	PARAMETERS:
		data = input data or parameter to use
		type = the query to call
 **/
module.exports = function (data, type) {
	
	if (type === "Destination") {
		return "SELECT Destination, DestinationType FROM TouchDestinationList " + 
				"WHERE ProductSerialAssociationID = ( " + 
				"SELECT " + 
				"	(CASE WHEN (SELECT COUNT(1) FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + data.serial + "' AND EndSerialNumber >= '" + data.serial + "') > 0 THEN " + 
				"	  (SELECT ProductSerialAssociationID FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + data.serial + "' AND EndSerialNumber >= '" + data.serial + "') " + 
				"	ELSE " + 
				"		1 " + 
				"	END))";


		
	} else {
		return "";
	}

	
};