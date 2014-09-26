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
var emailLead = "";
var typeRegistry = "";

//STATUS LEAD AND SURVEY
var STATUS_CREATE = 'CREATE';
var STATUS_BASE_CENTRAL = 'BASE_CENTRAL';
var STATUS_MARKETO = 'MARKETO';
var STATUS_CHECK_IN = 'CHECK_IN';
var STATUS_CHECK_IN_BASE_CENTRAL = 'CHECK_IN_BASE_CENTRAL';
var STATUS_CHECK_IN_MARKETO = 'CHECK_IN_MARKETO';


var dbapp = {
	openDatabase: function() {
		console.log("before");
		try {
			db = window.openDatabase(shortName, version, displayName, maxSize);
		} catch (error) {
			alert("openDatabase " + error);
		}
		db.transaction(dbapp.populateDB, callBacks.successDB, callBacks.errorQuery);
		console.log("after");
	},
	queryDemo: function() {
		db.transaction(dbapp.queryDB);
	},
	queryDB: function(tx) {
		console.log("consulta");
		tx.executeSql('SELECT * FROM Bookings WHERE country_id = ?',
				[localStorage.country], dbapp.querySuccess, callBacks.errorQuery);
	},
	querySuccess: function(tx, results) {
		console.log("querySuccess");
		$('#logLead').html("querySuccess");

		var s = "";
		if (results != null && results.rows != null) {
			for (var i = 0; i < results.rows.length; i++) {
				s += "<li><a href='edit.html?id=" + results.rows.item(i).id + "'>" + results.rows.item(i).name + "</a></li>";
			}
			$("#logLead").html(s);
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
		tx.executeSql('CREATE TABLE IF NOT EXISTS Leads(' +
				'email TEXT NOT NULL PRIMARY KEY,' +
				'country_id INTEGER NOT NULL, ' +
				'booking_id INTEGER NULL, ' +
				'name TEXT NOT NULL,' +
				'last_name TEXT NOT NULL,' +
				'phone TEXT NOT NULL,' +
				'address TEXT NOT NULL,' +
				'brand TEXT NOT NULL,' +
				'model TEXT NOT NULL,' +
				'year TEXT INTEGER NOT NULL,' +
				'model_audi TEXT NOT NULL,' +
				'type_registry TEXT NULL,' +
				'status TEXT NOT NULL,' +
				'control INTEGER NOT NULL)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS Surveys(' +
				'email TEXT NOT NULL PRIMARY KEY,' +
				'country_id INTEGER NOT NULL, ' +
				'experience TEXT NOT NULL,' +
				'testdrive_experience TEXT NOT NULL,' +
				'vehicles TEXT NOT NULL,' +
				'liked TEXT NOT NULL,' +
				'contact TEXT NOT NULL,' +
				'time TEXT NOT NULL,' +
				'model TEXT INTEGER NOT NULL,' +
				'status TEXT NOT NULL)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS Bookings(' +
				'id INTEGER NOT NULL PRIMARY KEY, ' +
				'country_id INTEGER NOT NULL, ' +
				'name TEXT NOT NULL, ' +
				'date TEXT NOT NULL,' +
				'quotas INTEGER NOT NULL)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS Models(' +
				'id INTEGER NOT NULL, ' +
				'country_id INTEGER NOT NULL, ' +
				'name TEXT NOT NULL, ' +
				'PRIMARY KEY (id, country_id))');
		tx.executeSql('CREATE TABLE IF NOT EXISTS Updates(' +
				'lastupdate TEXT NOT NULL)');
		tx.executeSql('INSERT INTO Users (id, country_id, profile_id, name, ' +
				'last_name, email, password, type_registry, language) ' +
				' VALUES (1, 1, 1, "Admin", "Admin", "admin@admin.com",' +
				'"21232f297a57a5a743894a0e4a801fc3", "DEALER", "en-US")');
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		} else {
			tx.executeSql('INSERT INTO Bookings (id, country_id, name, date, quotas) ' +
					' VALUES (1, 1, "Testing - Testing", "2014-09-29", 2)');
		}

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
			alert("updateUsers " + error);
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
		}, callBacks.errorQuery);
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
			}, callBacks.errorQuery);
		} catch (error) {
			alert("createUserDB " + error);
		}
	},
	//Update models from BD PHP
	updateModels: function(countries) {
		try {
			for (var country in countries) {
				var models = countries[country].models;
				for(var model in models){
					dbapp.searchModelDB(models[model], countries[country].id);
				}
			}
		} catch (error) {
			alert("updateModels " + error);
		}
	},
	searchModelDB : function(objModel, countryId){
		db.transaction(
				function(tx) {
					try {
						tx.executeSql('SELECT * FROM Models WHERE id = ? AND country_id = ?',
								[objModel.id, countryId],
								function(tx, result) {
									callBacks.successSearchModel(tx, result, objModel, countryId)
								},
								callBacks.errorQuery);
					} catch (error) {
						alert("searchModelDB : " + error);
					}
				}
		);
	},
	updateModelDB: function(tx, objModel, countryId) {
		try {
			var sql = 'UPDATE Models SET name = "' + objModel.name + '" ' +
					'WHERE id = ' + objModel.id + ' ' +
					'AND country_id = ' + countryId;
			//TODO: AJUSTAR SUCCESS           
			tx.executeSql(sql, [], function() {
			}, callBacks.errorQuery);
		} catch (error) {
			alert("updateModelDB " + error);
		}
	},
	createModelDB: function(tx, objModel, countryId) {
		try {
			var sql = 'INSERT INTO Models (id, country_id, name) ' +
					' VALUES (' + objModel.id +
					', ' + countryId +
					', "' + objModel.name + '")';
			//TODO: AJUSTAR SUCCESS  
			var xx = tx.executeSql(sql, [], function() {
			}, callBacks.errorQuery);
		} catch (error) {
			alert("createModelDB " + error);
		}
	},
	queryModels: function() {
		try {
			db.transaction(
					function(tx) {
						tx.executeSql('SELECT * FROM Models WHERE country_id = ? ',
								[localStorage.country],
								function(tx, result) {
									callBacks.successSearchModelsByCountry(tx, result)
								},
								callBacks.errorQuery);
					}
			);
		} catch (error) {
			alert("queryModels : " + error);
		}

	},
	
	//Update bookings from BD PHP
	updateBookings: function(bookings) {
		try {
			for (var booking in bookings) {
				dbapp.searchBookingDB(bookings[booking]);
			}
		} catch (error) {
			alert("updateBookings " + error);
		}
	},
	searchBookingDB: function(objBooking) {
		result = false;
		//$(".synchro_info_txt").append("searchBookingDB");

		db.transaction(
				function(tx) {
					try {
						tx.executeSql('SELECT * FROM Bookings WHERE id = ?',
								[objBooking.id],
								function(tx, result) {
									callBacks.successSearchBooking(tx, result, objBooking)
								},
								callBacks.errorQuery);
					} catch (error) {
						alert("searchBookingDB : " + error);
					}
				}
		);
	},
	updateBookingDB: function(tx, objBooking) {
		$("#log").append("updateBookingDB");
		try {
			var sql = 'UPDATE Bookings SET country_id = ' + objBooking.country.id + ', ' +
					'name = "' + objBooking.name + '", ' +
					'date = "' + objBooking.date + '"' + ', ' +
					'quotas = ' + objBooking.quotas + ' ' +
					'WHERE id = ' + objBooking.id;
			//TODO: AJUSTAR SUCCESS           
			tx.executeSql(sql, [], function() {
			}, callBacks.errorQuery);
		} catch (error) {
			alert("updateBookingDB " + error);
		}
	},
	createBookingDB: function(tx, objBooking) {
		try {
			var sql = 'INSERT INTO Bookings (id, country_id, name, date, quotas) ' +
					' VALUES (' +
					objBooking.id +
					', ' + objBooking.country.id +
					', "' + objBooking.name + '"' +
					', "' + objBooking.date + '"' +
					', "' + objBooking.quotas + '")';
			//TODO: AJUSTAR SUCCESS  
			var xx = tx.executeSql(sql, [], function() {
			}, callBacks.errorQuery);
		} catch (error) {
			alert("createBookingDB " + error);
		}
	},
	queryBookings: function() {
		try {
			db.transaction(
					function(tx) {
						tx.executeSql('SELECT * FROM Bookings WHERE country_id = ? AND quotas > ?',
								[localStorage.country, 0],
								function(tx, result) {
									callBacks.successSearchBookingsByCountry(tx, result)
								},
								callBacks.errorQuery);
					}
			);
		} catch (error) {
			alert("queryBookings : " + error);
		}

	},
	updateLeads: function(leads) {
		try {
			for (var lead in leads) {
				dbapp.searchLeadDB(leads[lead]);
			}
		} catch (error) {
			alert("updateLeads " + error);
		}
	},
	searchLeadDB: function(objLead) {
		result = false;

		db.transaction(
				function(tx) {
					try {
						tx.executeSql('SELECT * FROM Leads WHERE email = ?',
								[objLead.email],
								function(tx, result) {
									callBacks.successSearchLead(tx, result, objLead)
								},
								callBacks.errorQuery);
					} catch (error) {
						alert("searchLeadDB : " + error);
					}
				}
		);
	},
	updateLeadDB: function(tx, objLead) {
		try {
			var sql = 'UPDATE Leads SET booking_id = ?, name = ?, last_name = ?,' +
					'phone = ?, address = ?, brand = ?, model = ?, year = ?, ' +
					'model_audi = ?, type_registry = ?, status = ?, control = ? ' +
					'WHERE email = ? AND country_id = ?';
					
			//TODO: AJUSTAR SUCCESS           
			tx.executeSql(sql, [
					objLead.booking.id,
					objLead.name,
					objLead.lastName,
					objLead.phone,
					objLead.address,
					objLead.brand,
					objLead.model,
					objLead.year,
					objLead.modelAudi,
					objLead.typeRegistry,
					objLead.status,
					objLead.control,
					objLead.email,
					objLead.country.id
			], function() {
			}, callBacks.errorQuery);
		} catch (error) {
			alert("updateLeadDB " + error);
		}
	},
	createLeadDB: function(tx, objLead) {
		try {
	
			var sql = 'INSERT INTO Leads (email, country_id, booking_id, name, last_name,' +
					'phone, address, brand, model, year, ' +
					'model_audi, type_registry, status, control) VALUES (' +
					' "' + objLead.email + '", ' +
					objLead.country.id + ', ' +
					objLead.booking.id + ', ' +
					' "' + objLead.name + '", ' +
					' "' + objLead.lastName + '", ' +
					' "' + objLead.phone + '", ' +
					' "' + objLead.address + '", ' +
					' "' + objLead.brand + '", ' +
					' "' + objLead.model + '", ' +
					' "' + objLead.year + '", ' +
					' "' + objLead.modelAudi + '", ' +
					' "' + objLead.typeRegistry + '", ' +
					' "' + objLead.status + '", ' +
					' "' + objLead.control + '")';
			
			//TODO: AJUSTAR SUCCESS  
			var xx = tx.executeSql(sql, [], function() {
			}, callBacks.errorQuery);
		} catch (error) {
			alert("createLeadDB " + error);
		}
	},
	saveLead: function(tx, objLead) {
		console.log("dbapp.saveLead");
		try {
			var sql = 'INSERT INTO Leads (email, country_id, booking_id, name, last_name,' +
					'phone, address, brand, model, year, ' +
					'model_audi, type_registry, status, control) VALUES (' +
					' "' + objLead.email + '", ' +
					objLead.country_id + ', ' +
					objLead.booking_id + ', ' +
					' "' + objLead.name + '", ' +
					' "' + objLead.last_name + '", ' +
					' "' + objLead.phone + '", ' +
					' "' + objLead.address + '", ' +
					' "' + objLead.brand + '", ' +
					' "' + objLead.model + '", ' +
					' "' + objLead.year + '", ' +
					' "' + objLead.model_audi + '", ' +
					' "' + objLead.type_registry + '", ' +
					' "' + STATUS_CREATE + '", ' +
					' "' + md5(objLead.email) + '")';
			//TODO: AJUSTAR SUCCESS   
			var xx = tx.executeSql(sql, [],
					function() {
						$(':input', '#form_lead')
								.not(':radio, :button, :submit, :reset, :hidden')
								.val('');

						$("input[name='type_registry']").checkboxradio("refresh");
						$("input[name='model_audi']").checkboxradio("refresh");
						$(".ui-radio label").removeClass('ui-btn-active ui-radio-on');
//	 				$('#form_lead select').selectmenu('refresh', true) 

						$("#dialog_title").html(i18n.t("translation:general.dialog_lead_title"));
						$("#dialog_message").html(i18n.t("translation:general.dialog_lead_message"));
						$("#dialog_btn").html(i18n.t("translation:general.dialog_lead_button"));
						$("#leadSuccess").trigger("click");
						if(objLead.booking_id != "NULL"){
							dbapp.updateQuotasBooking(objLead.booking_id);
							dbapp.queryBookings();
						}
					},
					callBacks.errorSaveLead
					);
		} catch (error) {
			alert("bdapp.saveLead " + error);

		}
	},
	
	updateQuotasBooking : function(bookingId){
		db.transaction(
				function(tx) {
					try {
						tx.executeSql('UPDATE Bookings SET quotas=quotas-1 WHERE id = ?',
								[bookingId],
								function(tx, result) {
									console.log(result);
								},
								callBacks.errorQuery);
					} catch (error) {
						alert("updateQuotasBooking : " + error);
					}
				}
		);
	},	
	
	saveSurvey: function(tx, objSurvey) {
		console.log("dbapp.saveSurvey");
		try {
			var sql = 'INSERT INTO Surveys (email, country_id, experience, testdrive_experience, vehicles,' +
					'liked, contact, time, model, status) VALUES (' +
					' "' + objSurvey.email + '", ' +
					objSurvey.country_id + ', ' +
					' "' + objSurvey.experience + '", ' +
					' "' + objSurvey.testdrive_experience + '", ' +
					' "' + objSurvey.vehicles + '", ' +
					' "' + objSurvey.like + '", ' +
					' "' + objSurvey.contact + '", ' +
					' "' + objSurvey.time + '", ' +
					' "' + objSurvey.model + '", ' +
					' "' + STATUS_CREATE + '")';

			//$("#logSurvey").html("Insert : " + sql + "</br></br></br>");
			//TODO: AJUSTAR SUCCESS   
			var xx = tx.executeSql(sql, [],
					function() {
						$(':input', '#form_survey')
								.not(':radio, :checkbox, :button, :submit, :reset, :hidden')
								.val('');

						$("input[name='experience']").checkboxradio("refresh");
						$("input[name='testdrive_experience']").checkboxradio("refresh");
						$("input[name='vehicles']").checkboxradio("refresh");
						$("input[name='contact']").checkboxradio("refresh");
						$("input[name='time']").checkboxradio("refresh");
						$("input[name='model']").checkboxradio("refresh");

						$(".ui-radio label").removeClass('ui-btn-active ui-radio-on');
						$(".ui-checkbox label").removeClass('ui-btn-active ui-checkbox-on');
						
						$("#dialog_title").html(i18n.t("translation:general.dialog_survey_title"));
						$("#dialog_message").html(i18n.t("translation:general.dialog_survey_message"));
						$("#dialog_btn").html(i18n.t("translation:general.dialog_lead_button"));
						
						$("#surveySuccess").trigger("click");
					},
					callBacks.errorQuery
					);
		} catch (error) {
			alert("bdapp.saveSurvey " + error);

		}
	},
	sendLeads: function(status) {
		db.transaction(
				function(tx) {
					try {
						tx.executeSql('SELECT * FROM Leads WHERE status = ?',
								[status],
								function(tx, result) {
									callBacks.successSearchLeads(tx, result, status);
								},
								callBacks.errorQuery);
					} catch (error) {
						alert("sendLeads : " + error);
					}
				}
		);

	},
	sendSurveys: function() {
		db.transaction(
				function(tx) {
					try {
						tx.executeSql('SELECT * FROM Surveys WHERE status = ?',
								[STATUS_CREATE],
								function(tx, result) {
									callBacks.successSearchSurveys(tx, result)
								},
								callBacks.errorQuery);
					} catch (error) {
						alert("sendSurveys : " + error);
					}
				}
		);
	},
	searchLeadCkeckIn: function() {
		console.log("searchLeadCkeckIn");

		db.transaction(
				function(tx) {
					try {
						tx.executeSql('SELECT * FROM Leads WHERE status = ? OR status = ? OR status = ? AND country_id = ?',
								[STATUS_CREATE, STATUS_BASE_CENTRAL, STATUS_MARKETO, localStorage.country],
								function(tx, result) {
									callBacks.successSearchLeadsCheckIn(tx, result)
								},
								callBacks.errorQuery
								);
					} catch (error) {
						alert("searchLeadCkeckIn : " + error);
					}
				}
		);
	},
	searchLeadByQRCode: function(qrCode) {
		db.transaction(
				function(tx) {
					try {
						tx.executeSql('SELECT * FROM Leads WHERE control = ?',
								[qrCode],
								function(tx, result) {
									callBacks.successSearchLeadQRCodeOrEmail(tx, result)
								},
								callBacks.errorQuery);
					} catch (error) {
						alert("searchLeadByQRCode : " + error);
					}
				}
		);

	},
	searchLeadByEmail: function(email) {
		db.transaction(
				function(tx) {
					try {
						tx.executeSql('SELECT * FROM Leads WHERE email = ?',
								[email],
								function(tx, result) {
									callBacks.successSearchLeadQRCodeOrEmail(tx, result)
								},
								callBacks.errorQuery);
					} catch (error) {
						alert("searchLeadByEmail : " + error);
					}
				}
		);

	},
	updateDateLastSyncro: function(date) {
		try {
			db.transaction(
					function(tx) {
						var sql = 'INSERT INTO Updates (lastupdate) VALUES ("' + date.datelocal + '")';
						tx.executeSql(sql, [], function(tx, result) {
							$('.synchro').addClass('synchro_updated');
							$('.synchro_updated').addClass('synchro');
							$('.synchro_info_txt').html(date.datelocal);
							setTimeout(function() {
								$('.synchro').addClass('synchro_updated');
								$('.synchro_updated').addClass('synchro');
							}, 120000);
						},
								callBacks.errorQuery);
					}
			);
		} catch (error) {
			alert("updateDateLastSyncro : " + error);
		}
	},
	checkInLead: function(email, typeReg) {
		try {
			db.transaction(
					function(tx) {
						var sql = 'UPDATE Leads SET status = ? WHERE email = ? ';
						tx.executeSql(sql, [STATUS_CHECK_IN, email], function(tx, result) {
							if(typeReg == "DEALER"){
								$.mobile.changePage("#survey");
							}else{
								
							}
							emailLead = "";
							typeRegistry = "";

						},
						callBacks.errorQuery);
					}
			);
		} catch (error) {
			alert("checkInLead : " + error);
		}
	}

};