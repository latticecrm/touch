/** DATABASE CONNECTION SERVICE **/
//require postgres
var pg = require("pg");
//generate the connection string as per Amazon Redshift suggestion 
var connectionString = "postgresql://touchsa:TouchAdmin1@touchtap.cqbvah02ztfo.us-west-2.redshift.amazonaws.com:5439/touchtap"
//create client object
var client = new pg.Client(connectionString);
//connect to the client
client.connect();
//export client object
module.exports = client;

