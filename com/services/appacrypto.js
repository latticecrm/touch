/** DECRYPT SERIAL NUMBER 
	PARAMETERS:
		serial number
 **/
 var crypto = require('crypto');

module.exports = function (serialnumber) {
	//var algorithm = 'aes-256-gcm';
	var algorithm = 'aes192';
	//var algorithm = 'aes-256-cbc';
  	var password = "app@V1s10n";
  	var salt = "sj2dc2la";
  	var iv = "dC2Sj0Rps14lATag";

console.log(serialnumber);

  	//crypto.pbkdf2(password, salt, 65536, 128, (err, key) => {
  	crypto.pbkdf2(password, salt, 1000, 192/8, (err, key) => {
  		/*var binkey = new Buffer(key, 'ascii');
        var biniv = new Buffer(iv, 'base64');*/
        var binkey = new Buffer(key);
        var biniv = new Buffer(iv, 'UTF-8');
        var decipher = crypto.createDecipheriv(algorithm, binkey, biniv);
        var decodedSerial = decipher.update(new Buffer(serialnumber), 'binary', 'utf8');
        decodedSerial += decipher.final('utf8');

     //    var decodedSerial =  Buffer.concat([
	    //     decipher.update(serialnumber),
	    //     decipher.final()
	    // ]);

        console.log(decodedSerial);
        return decodedSerial;
    });

  	/*var decipher = crypto.createDecipheriv(algorithm, password, iv)
	decipher.setAuthTag(encrypted.tag);
	var dec = decipher.update(encrypted.content, 'hex', 'utf8')
	dec += decipher.final('utf8');
	return dec;*/

};