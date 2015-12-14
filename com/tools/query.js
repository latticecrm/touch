/** GENERIC QUERY SERVICE ** 
	PARAMETERS:
		data = input data or parameter to use
		type = the query to call
 **/
module.exports = function (data, type) {
	
	if (type === "Destination") {
		return "SELECT Destination, DestinationType FROM TouchDestinationList " + 
				"WHERE StartDateTime <= '" + data.usrdt + "' AND EndDateTime >= '" + data.usrdt + "' AND ProductSerialAssociationID = ( " + 
				"SELECT " + 
				"	(CASE WHEN (SELECT COUNT(1) FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + data.serial + "' AND EndSerialNumber >= '" + data.serial + "') > 0 THEN " + 
				"	  (SELECT ProductSerialAssociationID FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + data.serial + "' AND EndSerialNumber >= '" + data.serial + "') " + 
				"	ELSE " + 
				"		1 " + 
				"	END))";

	} if (type === "Set Destination") {
		return "UPDATE TouchDestinationList SET Destination = PostDestination " + 
				"WHERE StartDateTime <= '" + data.usrdt + "' AND EndDateTime >= '" + data.usrdt + "' AND ProductSerialAssociationID = ( " + 
				"SELECT " + 
				"	(CASE WHEN (SELECT COUNT(1) FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + data.serial + "' AND EndSerialNumber >= '" + data.serial + "') > 0 THEN " + 
				"	  (SELECT ProductSerialAssociationID FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + data.serial + "' AND EndSerialNumber >= '" + data.serial + "') " + 
				"	ELSE " + 
				"		1 " + 
				"	END))";
	} if (type === "Product Serial") {
		return "SELECT ProductSerialAssociationID, CustomerID, ProductID " + 
			//"FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + data.serial + "' AND EndSerialNumber => '" + data.serial + "'";
			"FROM ProductSerialAssociation WHERE ProductSerialAssociationID = ( " + 
				"SELECT " + 
				"	(CASE WHEN (SELECT COUNT(1) FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + data.serial + "' AND EndSerialNumber >= '" + data.serial + "') > 0 THEN " + 
				"	  (SELECT ProductSerialAssociationID FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + data.serial + "' AND EndSerialNumber >= '" + data.serial + "') " + 
				"	ELSE " + 
				"		1 " + 
				"	END))";
	} if (type === "Tag") {
		return "SELECT TouchTagID FROM dbo.TouchTag WHERE SerialNumber = '" + data.serial + "' AND CustomerID='" + data.CustomerID + "' AND ProductID='" + data.ProductID + "'";
	
	} if (type === "Insert Tag") {
		return "INSERT INTO dbo.TouchTag(SerialNumber, CustomerID, ProductID, StatusID, Active, CreationDate, UpdationDate) " + 
				"SELECT " +
					"'" + data.serial + "', " + 
					"'" + data.CustomerID + "', " + 
					"'" + data.ProductID + "', " + 
					"(SELECT StatusID FROM dbo.Status WHERE Status = '" + data.Status + "' And Active = 1)," + 
					"1, GetDate(),GetDate();" 
	} if (type === "Select Device") {	
		return "SELECT TouchDeviceID FROM TouchDevice WHERE DeviceType='" + data.Device + "' AND PhoneNumber='" + data.PhoneNumber + "'";
	} if (type === "Insert Device") {	
		return "INSERT INTO TouchDevice(DeviceType,PhoneNumber,CreationDate) VALUES('" + data.Device + "', '" + data.PhoneNumber + "',GetDate())";
	} if (type === "TagAccess Insert") {	
		return "INSERT INTO TouchBase (TouchDeviceID,ProductSerialAssociationID,TouchTagID,SerialNumber,PhoneNON,CustomerIdentityNumber, " +
			"Address,Latitude,Lontitude,CreationDateTime,MobilePhoneDetails,AddressLine,City,State,ZipCode,Country,FacebookLike,TwitterLike, " +
			"Instagram,TagLike) " + 
			"SELECT " + 
				"(SELECT Top 1 TouchDeviceID FROM TouchDevice WHERE DeviceType='" + data.Device + "' AND PhoneNumber='" + data.PhoneNumber + "') as TouchDeviceID," +
				"" + data.ProductSerialAssociationID + "," + 
				"(SELECT Top 1 TouchTagID FROM dbo.TouchTag WHERE SerialNumber = '" + data.serial + "' AND CustomerID='" + data.CustomerID + "' AND ProductID='" + data.ProductID + "') as TouchTagID," +
				"'" + data.serial + "'," + 
				"'" + data.PhoneNON + "'," + 
				"(SELECT Top 1 CustomerIdentityNumber FROM Customer WHERE CustomerID='" + data.CustomerID + "') as CustomerIdentityNumber," +
				"'" + data.Address + "'," + 
				"'" + data.lat + "'," + 
				"'" + data.lng + "'," + 
				"GetDate()," + 
				"'" + data.PhoneDetails + "'," + 
				"'" + data.AddressLine + "'," + 
				"'" + data.City + "'," + 
				"'" + data.State + "'," + 
				"'" + data.ZipCode + "'," + 
				"'" + data.Country + "'," + 
				"" + data.FacebookLike + "," + 
				"" + data.TwitterLike + "," + 
				"'" + data.Instagram + "'," + 
				"" + data.TagLike + "" + 
			";"
	} else {
		return "";
	}

	
};