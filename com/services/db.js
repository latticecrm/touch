/** DATABASE CONNECTION SERVICE **/
//require postgres
var pg = require("pg");
//generate the connection string as per Amazon Redshift suggestion 
var connectionString = "postgresql://touchsa:Appaadmin1@appatouch-dw.cwyf4obtcnqf.us-east-1.redshift.amazonaws.com:5439/touch"
//create client object
var client = new pg.Client(connectionString);
//connect to the client
client.connect();
//export client object
module.exports = client;

