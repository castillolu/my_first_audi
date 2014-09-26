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
	errorSaveLead : function(transaction, error)
	{
		$("#dialog_title").html(i18n.t("translation:general.dialog_lead_exist_title"));
		$("#dialog_message").html(i18n.t("translation:general.dialog_lead_exist_message"));
		$("#dialog_btn").html(i18n.t("translation:general.dialog_lead_exist_button"));
		$("#leadSuccess").trigger("click");

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
	successSearchModel: function(transaction, results, objModel, countryId)
	{
		if (results.rows.length > 0) {
			db.transaction(
					function(tx) {
						dbapp.updateModelDB(tx, objModel, countryId);
					}
			);
		} else {
			db.transaction(
					function(tx) {
						dbapp.createModelDB(tx, objModel, countryId);
					}
			);
		}
	},
	successSearchModelsByCountry: function(transaction, results)
	{
		console.log("successSearchModelsByCountry");
		var html = '<legend data-i18n="survey.model"></legend>';
		if (results.rows.length > 0) {
			for(var i = 0; i < results.rows.length; i++){
				var id = results.rows.item(i).id
				var name = results.rows.item(i).name;
				html += '<input type="checkbox" name="model" id="model-' + i + '" value="' + id + '" />';
				html += '<label for="model-' + i + '">' + name + '</label>';
			}
		}
		$("#survey_model").html(html);
		$("input[type='checkbox']").checkboxradio("refresh");
		
		
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
		console.log("successSearchBookingsByCountry");
		var html = '<option value="">' + i18n.t("translation:register.select_booking") + '</option>';

		if (results.rows.length > 0) {
			for(var i = 0; i < results.rows.length; i++){
				var id = results.rows.item(i).id
				var textOpt = results.rows.item(i).date;
				textOpt += " - ";
				textOpt += results.rows.item(i).name;
				html += '<option value="' + id + '">' + textOpt + '</option>';
			}
		}
		$("#booking_id").html(html);
		$('#form_lead select#booking_id').selectmenu('refresh');
		$('#form_lead select#country_id').selectmenu('refresh');
		
	},

	successSearchLeads : function(tx, results)
	{
		try {
			if (results.rows.length > 0) {
				for(var i = 0; i < results.rows.length; i++){
					var objLead = {};
					objLead.email = results.rows.item(i).email;
					objLead.country = results.rows.item(i).country_id;
					objLead.booking = results.rows.item(i).booking_id;
					objLead.name = results.rows.item(i).name;
					objLead.lastName = results.rows.item(i).last_name;
					objLead.modelAudi = results.rows.item(i).model_audi;
					objLead.address = results.rows.item(i).address;
					objLead.phone = results.rows.item(i).phone;
					objLead.brand = results.rows.item(i).brand;
					objLead.model = results.rows.item(i).model;
					objLead.year = results.rows.item(i).year;
					objLead.typeRegistry = results.rows.item(i).type_registry;
					objLead.status = STATUS_BASE_CENTRAL;

					$.ajax(urlAPI + "/leads/lead/", {
						type: "PUT",
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "Basic " + btoa(authAPI));
						},
						crossDomain: true,
						data: JSON.stringify(objLead),
						contentType: "application/json",
						success: function(e) {
							if (e.status) {
								synchro = 'true';
							} else {
								synchro = 'false';
								$("#logSyn").html("Error al crear el registro : " + e.error);
							}
						},
						error: function(jqXHR, text_status, strError) {
							alert(text_status + " " + strError);
						}
					});
				}
			}
		}
		catch (error)
		{
			alert("Error was in successSearchLeads : " + error);
		}				

	},

	successSearchSurveys : function(tx, results)
	{
		try {
			if (results.rows.length > 0) {
				for(var i = 0; i < results.rows.length; i++){
					var objSurvey = {};
					objSurvey.email = results.rows.item(i).email;
					objSurvey.country = results.rows.item(i).country_id;
					objSurvey.experience = results.rows.item(i).experience;
					objSurvey.testdrive_experience = results.rows.item(i).testdrive_experience;
					objSurvey.vehicles = results.rows.item(i).vehicles;
					objSurvey.like = results.rows.item(i).liked;
					objSurvey.contact = results.rows.item(i).contact;
					objSurvey.time = results.rows.item(i).time;
					objSurvey.model = results.rows.item(i).model;
					objSurvey.status = STATUS_BASE_CENTRAL;

					$.ajax(urlAPI + "/surveys/survey/", {
						type: "PUT",
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "Basic " + btoa(authAPI));
						},
						crossDomain: true,
						data: JSON.stringify(objSurvey),
						contentType: "application/json",
						success: function(e) {
							if (e.status) {
								$("#logSyn").html("Creacion de registro con el ID : " + e.id);
							} else {
								$("#logSyn").html("Error al crear el registro : " + e.error);
							}
						},
						error: function(jqXHR, text_status, strError) {
							alert(text_status + " " + strError);
						}
					});
				}
			}
		}
		catch (error)
		{
			alert("Error was in successSearchSurveys : " + error);
		}				

	},

	successSearchLeadsCheckIn : function(tx, results){

        console.log("successSearchLeadsCheckIn");
		try {
			var html = "";
			$("#searchLead").html("");
			if (results.rows.length > 0) {
				for(var i = 0; i < results.rows.length; i++){
					var obj = {};
					obj.email = results.rows.item(i).email;
					obj.name = results.rows.item(i).name;
					obj.lastName = results.rows.item(i).last_name;
					var content = obj.name + " " + obj.lastName + " (" + obj.email + ")";
					html += '<li><a id="'+ obj.email + '" href="#">' + content + '</a></li>';

				}
			}
			$("#searchLead").html(html);
		}
		catch (error)
		{
			alert("Error was in successSearchLeadsCheckIn : " + error);
		}			
	},

	successSearchLeadQRCodeOrEmail : function(tx, results){
        console.log("successSearchLeadQRCodeOrEmail");
		try {
			if (results.rows.length > 0) {
				$("#list-data-lead").show();
				emailLead = results.rows.item(0).email;
				typeRegistry = results.rows.item(0).type_registry;
				$("#list-data-lead .name").html(results.rows.item(0).name);
				$("#list-data-lead .last_name").html(results.rows.item(0).last_name);
				$("#list-data-lead .email").html(results.rows.item(0).email);
				$("#list-data-lead .phone").html(results.rows.item(0).phone);
				$("#list-data-lead .address").html(results.rows.item(0).address);
				$("#list-data-lead .current_car").html(results.rows.item(0).brand + " / " + results.rows.item(0).model + " / " + results.rows.item(0).year);
				$("#list-data-lead .model_audi").html(results.rows.item(0).model_audi);
				$("#list-data-lead .type_registry").html(results.rows.item(0).type_registry);
			}
		}
		catch (error)
		{
			alert("Error was in successSearchLeadQRCode : " + error);
		}			


	}

};
