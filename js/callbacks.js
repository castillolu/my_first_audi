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
			if (typeof (Storage) !== "undefined") {
				localStorage.setItem("status", true);
				localStorage.setItem("name", results.rows.item(0).name);
				localStorage.setItem("last_name", results.rows.item(0).last_name);
				localStorage.setItem("email", results.rows.item(0).email);
				localStorage.setItem("language", results.rows.item(0).language);
				localStorage.setItem("country", results.rows.item(0).country_id);
				localStorage.setItem("type_registry", results.rows.item(0).type_registry);
			} else {
				// Sorry! No Web Storage support..
			}
		} else {
			if (typeof (Storage) !== "undefined") {
				localStorage.clear();
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
	},
	successSearchBooking: function(transaction, results, objBooking)
	{
		if (results.rows.length > 0) {
			db.transaction(
					function(tx) {
						dbapp.updateBookingDB(tx, objBooking);
					}
			);
		} else {
			db.transaction(
					function(tx) {
						dbapp.createBookingDB(tx, objBooking);
					}
			);
		}
	},
	successSearchBookingsByCountry: function(transaction, results)
	{
		var html = '<option value="" data-i18n="register.select_booking"></option>';

		if (results.rows.length > 0) {
			for(var i = 0; i < results.rows.length; i++){
				var id = results.rows.item(i).id
				var textOpt = results.rows.item(i).date;
				textOpt += "  - ";
				textOpt += results.rows.item(i).name;
				html += '<option value="' + id + '">' + textOpt + '</option>';
			}
		}
		$("#booking_id").html(html);
	}

};
