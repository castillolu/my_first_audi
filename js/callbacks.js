/* 
/**
 * @author Luis Castillo
 */
var statusTrans = false;

var callBacks = {

	errorQuery: function(transaction, error)
	{
		// error.message is a human-readable string.
		// error.code is a numeric error code
		alert('Oops.  Error was ' + error.message + ' (Code ' + error.code + ')');

		result = false;
	},
	successQuery: function(transaction, results)
	{
		if (results.rows.length > 0) {
			statusTrans = true;
		} else {
			statusTrans = false;
		}
	},
	successAuth: function(transaction, results)
	{
		if (results.rows.length > 0) {
			if(typeof(Storage) !== "undefined") {
				localStorage.setItem("status", true);
				localStorage.setItem("name", results.rows.item(0).name);
				localStorage.setItem("last_name", results.rows.item(0).last_name);
				localStorage.setItem("language", results.rows.item(0).language);
				localStorage.setItem("country", results.rows.item(0).country);
				localStorage.setItem("email", results.rows.item(0).email);
			} else {
				// Sorry! No Web Storage support..
			}			
		} else {
			if(typeof(Storage) !== "undefined") {
				localStorage.setItem("status", false);
			} else {
				// Sorry! No Web Storage support..
			}			
		}
	},
	
	// Transaction success callback
	successDB: function() {
		console.log("success!");

	},
	
	successSearchUser: function(transaction, results, objUser)
	{
		if (results.rows.length > 0) {
			db.transaction(
					function(tx) {
						dbapp.updateUserDB(tx, objUser);
					}
			);
		} else {
			db.transaction(
					function(tx) {
						dbapp.createUserDB(tx, objUser);
					}
			);
		}
	}	
	
};



