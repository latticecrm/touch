/** GENERIC QUERY SERVICE ** 
	PARAMETERS:
		data = input data or parameter to use
		type = the query to call
 **/
module.exports = function (data, type) {
	
	if (type === "Destination") {
		return "SELECT Destination, DestinationType FROM TouchDestinationList " + 
				"WHERE StartDateTime <= $1 AND EndDateTime >= $1 AND ProductSerialAssociationID = ( " + 
				"SELECT " + 
				"	(CASE WHEN (SELECT COUNT(1) FROM ProductSerialAssociation WHERE StartSerialNumber <= $2 AND EndSerialNumber >= $2) > 0 THEN " + 
				"	  (SELECT ProductSerialAssociationID FROM ProductSerialAssociation WHERE StartSerialNumber <= $2 AND EndSerialNumber >= $2) " + 
				"	ELSE " + 
				"		1 " + 
				"	END))";

	} if (type === "Set Destination") {
		return "UPDATE TouchDestinationList SET Destination = PostDestination " + 
				"WHERE StartDateTime <= $1 AND EndDateTime >= $1 AND ProductSerialAssociationID = ( " + 
				"SELECT " + 
				"	(CASE WHEN (SELECT COUNT(1) FROM ProductSerialAssociation WHERE StartSerialNumber <= $2 AND EndSerialNumber >= $2) > 0 THEN " + 
				"	  (SELECT ProductSerialAssociationID FROM ProductSerialAssociation WHERE StartSerialNumber <= $2 AND EndSerialNumber >= $2) " + 
				"	ELSE " + 
				"		1 " + 
				"	END))";
	} if (type === "Product Serial") {
		return "SELECT ProductSerialAssociationID, CustomerID, ProductID " + 
			//"FROM ProductSerialAssociation WHERE StartSerialNumber <= '" + data.serial + "' AND EndSerialNumber => '" + data.serial + "'";
			"FROM ProductSerialAssociation WHERE ProductSerialAssociationID = ( " + 
				"SELECT " + 
				"	(CASE WHEN (SELECT COUNT(1) FROM ProductSerialAssociation WHERE StartSerialNumber <= $1 AND EndSerialNumber >= $1) > 0 THEN " + 
				"	  (SELECT ProductSerialAssociationID FROM ProductSerialAssociation WHERE StartSerialNumber <= $1 AND EndSerialNumber >= $1) " + 
				"	ELSE " + 
				"		1 " + 
				"	END))";
	} if (type === "Tag") {
		return "SELECT TouchTagID FROM dbo.TouchTag WHERE SerialNumber=$1 AND CustomerID=$2 AND ProductID=$3";
	
	} if (type === "Insert Tag") {
		return "INSERT INTO dbo.TouchTag(SerialNumber, CustomerID, ProductID, StatusID, Active, CreationDate, UpdationDate) " + 
				"SELECT $1, $2, $3, " + 
					"(SELECT StatusID FROM dbo.Status WHERE Status = $4 And Active = 1)," + 
					"1, GetDate(),GetDate();" 
	} if (type === "Select Device") {	
		return "SELECT TouchDeviceID FROM TouchDevice WHERE DeviceType=$1 AND PhoneNumber=$2";
	} if (type === "Insert Device") {	
		return "INSERT INTO TouchDevice(DeviceType,PhoneNumber,CreationDate) VALUES($1, $2,GetDate())";
	} if (type === "TagAccess Insert") {	
		return "INSERT INTO TouchBase (TouchDeviceID,ProductSerialAssociationID,TouchTagID,SerialNumber,PhoneNON,CustomerIdentityNumber, " +
			"Address,Latitude,Lontitude,CreationDateTime,MobilePhoneDetails,AddressLine,City,State,ZipCode,Country,FacebookLike,TwitterLike, " +
			"Instagram,TagLike) " + 
			"SELECT " + 
				"(SELECT Top 1 TouchDeviceID FROM TouchDevice WHERE DeviceType=$1 AND PhoneNumber=$2) as TouchDeviceID," +
				"$3," + 
				"(SELECT Top 1 TouchTagID FROM dbo.TouchTag WHERE SerialNumber = $4 AND CustomerID=$5 AND ProductID=$6) as TouchTagID," +
				"$4,$7," + 
				"(SELECT Top 1 CustomerIdentityNumber FROM Customer WHERE CustomerID=$5) as CustomerIdentityNumber," +
				"$8,$9,$10,GetDate(),$11,$12,$13,$14,$15,$16,$17,$18,$19,$20" + 
			";"
	} if (type === "ProductWithLikeFlag") {	
		return "SELECT productidentitynumber FROM Product WHERE specialaction = 'Like'"
	} else {
		return "";
	}

	
};