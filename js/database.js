/**
 * @author Luis Castillo
 */

// global variables
var db = null;
var shortName = 'DB_MYAUDI.sqllite';
var version = '1.0';
var displayName = 'DB_My_First_AUDI';
var maxSize = 2097152;
var result = false;


var dbapp = {
	openDatabase: function() {
		console.log("before");
		try {
			db = window.openDatabase(shortName, version, displayName, maxSize);
		} catch (error) {
			alert("openDatabase " +error);
		}
		db.transaction(dbapp.populateDB, callBacks.successDB, callBacks.errorQuery);
		console.log("after");
	},
	queryDemo: function() {
		db.transaction(dbapp.queryDB);
	},
	queryDB: function(tx) {
		console.log("consulta");
		tx.executeSql('SELECT * FROM Users', [], dbapp.querySuccess, callBacks.errorQuery);
	},
	querySuccess: function(tx, results) {
		console.log("querySuccess");
		$('#info').html("querySuccess");

		var s = "";
		if (results != null && results.rows != null) {
			for (var i = 0; i < results.rows.length; i++) {
				s += "<li><a href='edit.html?id=" + results.rows.item(i).id + "'>" + results.rows.item(i).name + "</a></li>";
			}
			$("#info").html(s);
		} else {
			console.log("null");
		}
		// this will be empty since no rows were inserted.
		console.log(results);
	},
	// Populate the database 
	//
	populateDB: function(tx) {
		console.log("create");
		tx.executeSql('CREATE TABLE IF NOT EXISTS Users(' +
				'id INTEGER NOT NULL PRIMARY KEY, ' +
				'country_id INTEGER NOT NULL, ' +
				'profile_id INTEGER NOT NULL, ' +
				'name TEXT NOT NULL,' +
				'last_name TEXT NOT NULL,' +
				'email TEXT NOT NULL,' +
				'password TEXT NOT NULL,' +
				'type_registry TEXT NOT NULL,' +
				'language TEXT NOT NULL)');
		tx.executeSql('INSERT INTO Users (id, country_id, profile_id, name, ' +
				'last_name, email, password, type_registry, language) ' +
				' VALUES (1, 1, 1, "Admin", "Admin", "admin@admin.com",' +
				'"21232f297a57a5a743894a0e4a801fc3", "DEALER_AND_ON_SITE", "en-us")');
	},
	//login users
	auth: function(user, pass) {
		db.transaction(
				function(tx) {
					tx.executeSql('SELECT * FROM Users WHERE password = ? AND email = ?',
							[md5(pass), user],
							callBacks.successAuth,
							callBacks.errorQuery);
				}
		);
	},
	//Update users from BD PHP
	updateUsers: function(users) {
		$("#info").append("Update user each per each");
		try {
			for (var user in users) {
				dbapp.searchUserDB(users[user]);
			}
		} catch (error) {
			alert("updateUsers " +error);
		}
	},
	searchUserDB: function(objUser) {
		result = false;

		db.transaction(
				function(tx) {
					try {
						tx.executeSql('SELECT * FROM Users WHERE id = ?',
								[objUser.id],
								function(tx, result) {
									callBacks.successSearchUser(tx, result, objUser)
								},
								callBacks.errorQuery);
					} catch (error) {
						alert("SearchUserDB : " + error);
					}
				}
		);
	},
	updateUserDB: function(tx, objUser) {
		var sql = 'UPDATE Users SET country_id = ' + objUser.country.id + ', ' +
				'profile_id = ' + objUser.profile.id + ', ' +
				'name = "' + objUser.name + '", ' +
				'last_name = "' + objUser.last_name + '"' + ', ' +
				'email = "' + objUser.email + '"' + ', ' +
				'password = "' + objUser.password + '"' + ', ' +
				'type_registry = "' + objUser.country.typeRegistry + '"' + ', ' +
				'language = "' + objUser.language + '" ' +
				'WHERE id = ' + objUser.id;
		//TODO: AJUSTAR SUCCESS           
		tx.executeSql(sql, [], function() {
			$("#info").append("Update : " + sql + "\n\n\n\n");
		}, result.errorQuery);
	},
	createUserDB: function(tx, objUser) {
		try {
			var sql = 'INSERT INTO Users (id, country_id, profile_id, name, ' +
					'last_name, email, password, type_registry, language) ' +
					' VALUES (' +
					objUser.id +
					', ' + objUser.country.id +
					', ' + objUser.profile.id +
					', "' + objUser.name + '"' +
					', "' + objUser.last_name + '"' +
					', "' + objUser.email + '"' +
					', "' + objUser.password + '"' +
					', "' + objUser.country.typeRegistry + '"' +
					', "' + objUser.language + '")';
			//TODO: AJUSTAR SUCCESS   
			var xx = tx.executeSql(sql, [], function() {
				$("#info").append("Insert : " + sql + "\n\n\n\n");
			}, result.errorQuery);
		} catch (error) {
			alert("createUserDB " +error);
		}
	}
};
