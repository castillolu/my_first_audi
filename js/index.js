/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var urlAPI = "http://myfirstaudi.info/api";
var authAPI = "admin:1234";
var appStart = false;
var synchro = 'true';
var sendSynchro = true;

var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// `load`, `deviceready`, `offline`, and `online`.
	bindEvents: function() {
		var language = window.navigator.userLanguage || window.navigator.language;
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			document.addEventListener('deviceready', this.onDeviceReady, false);
		} else {
			$(document).on('ready', this.onDeviceReady);
		}
		document.getElementById('login').addEventListener('submit', this.loginAuth, false);
		document.addEventListener("offline", this.isOffline, false);
		document.addEventListener("online", this.isOnline, false);
		setTimeout(app.setLanguage(language, true), 1000);
	},
	// deviceready Event Handler
	//
	// The scope of `this` is the event. In order to call the `receivedEvent`
	// function, we must explicity call `app.receivedEvent(...);`
	onDeviceReady: function() {
		app.receivedEvent('deviceready');
		app.loadContent();
		setTimeout(function() {
			app.loadActions();
			app.loadAutoCompleteLead();
		}, 500);
	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		console.log('Received Event: ' + id);
		dbapp.openDatabase();
	},
	setLanguage: function(language, firstTime)
	{
		if (firstTime) {
			$.i18n.init(function(t) {
				lng: language;
				$(".login, .general, .register, .survey, .checkin, .dashboard").i18n();
			});
		} else {
			i18n.setLng(language, function(t) {
				$(".login, .general, .register, .survey, .checkin, .dashboard").i18n();
			});
		}
	},
	loadContent: function() {
		$("#dashboard").load("dashboard.html", function() {
			console.log("Load register.");
		});
		$("#register").load("register.html", function() {
			console.log("Load register.");
		});
		$("#check-in").load("checkin.html", function() {
			console.log("Load check-in.");
		});
		$("#survey").load("survey.html", function() {
			console.log("Load survey.");
		});
		if (localStorage.status == 'true') {
			setTimeout(app.setLanguage(localStorage.language, false), 1000);
			$.mobile.changePage("#dashboard");
		}

	},
	loadActions: function() {
		$('#btn_lead').on('click', app.goToFormLead);
		$('#btn_check_in').on('click', app.goToFormCheckIn);
		$('#btn_synchro').on('click', app.goToSynchro);
		$('#btn_survey').on('click', app.goToFormSurvey);
		$('#btn_logout').on('click', app.logOut);
		$('#onsite').on('click', app.hideBooking);
		$('#dealer').on('click', app.showBooking);
		$('#btn_qr_code').on('click', app.scan);
		$('#btn_check_in_end').on('click', app.confirmCheckInLead);
		$('#dialog_checkin_btn_continue').on('click', app.checkInLead);
		$('.back_to_menu').on('click', app.backDashboard);
		$('.btn_accept').on('click', app.enableDisableMenu("true"));
		$(document).on('click', 'ul#searchLead li a', app.selectLead);
		$("#list-data-lead").hide();
		$(".aviso_confirma").hide();
//        $('#query').on('click', dbapp.queryDemo);
		app.validateLead();
		app.validateSurvey();
	},
	validateLead: function() {
		$("#form_lead").validate({
			rules: {
				name: {required: true},
				last_name: {required: true},
				email: {required: true},
				phone: {required: true},
				address: {required: true},
				current_car_brand: {required: true},
				current_car_model: {required: true},
				current_car_year: {required: true},
				model_audi: {required: true}
			},
			messages: {
				email: {required: i18n.t("translation:register.requiere_email")},
				name: {required: i18n.t("translation:register.requiere_name")},
				last_name: {required: i18n.t("translation:register.requiere_last_name")},
				phone: {required: i18n.t("translation:register.requiere_phone")},
				address: {required: i18n.t("translation:register.requiere_address")},
				current_car_brand: {required: i18n.t("translation:register.requiere_brand")},
				current_car_model: {required: i18n.t("translation:register.requiere_model")},
				current_car_year: {required: i18n.t("translation:register.requiere_year")},
				model_audi: {required: i18n.t("translation:register.requiere_model_audi")}
			},
			errorLabelContainer: "#messageErrorLead",
			wrapper: "li",
			submitHandler: function(form) {
				console.log("submitHandler");
				app.saveLead();
			}
		});
	},
	saveLead: function() {
		console.log("app.saveLead");
		try {
			//disable the button so we can't resubmit while we wait
			//$("#submit-lead", this).attr("disabled", "disabled");
			var objLead = {};
			objLead.type_registry = $("input[name='type_registry']:checked").val();
			objLead.name = $("#name").val();
			objLead.last_name = $("#last_name").val();
			objLead.email = $("#email_lead").val();
			objLead.phone = $("#phone").val();
			objLead.address = $("#address").val();
			objLead.brand = $("#current_car_brand").val();
			objLead.model = $("#current_car_model").val();
			objLead.year = $("#current_car_year").val();
			objLead.model_audi = $("input[name='model_audi']:checked").val();
			objLead.booking_id = $("#booking_id").val() == "" ? "NULL" : $("#booking_id").val();
			objLead.country_id = $("#country_id").val();
			db.transaction(
					function(tx) {
						dbapp.saveLead(tx, objLead);
					}
			);
			return false;
		} catch (error) {
			alert("app.saveLead " + error);
		}
	},
	validateSurvey: function() {
		$("#form_survey").validate({
			rules: {
				experience: {required: true},
				email_survey: {required: true},
				testdrive_experience: {required: true},
				like: {required: true},
				contact: {required: true},
				time: {required: true}
			},
			messages: {
				email_survey: {required: i18n.t("translation:register.requiere_email")},
				experience: {required: i18n.t("translation:survey.requiere_experience")},
				testdrive_experience: {required: i18n.t("translation:survey.requiere_testdrive_experience")},
				like: {required: i18n.t("translation:survey.requiere_like")},
				contact: {required: i18n.t("translation:survey.requiere_contact")},
				time: {required: i18n.t("translation:survey.requiere_time")},
			},
			errorLabelContainer: "#messageErrorSurvey",
			wrapper: "li",
			submitHandler: function(form) {
				console.log("submitHandler");
				app.saveSurvey();
			}
		});
	},
	saveSurvey: function() {
		$('#logIndex').html("app.saveSurvey");
		try {
			//disable the button so we can't resubmit while we wait
			//$("#submit-lead", this).attr("disabled", "disabled");

			var chkArray = [];
			$("input[name='model']:checked").each(function() {
				chkArray.push($(this).val());
			});

			var objSurvey = {};
			objSurvey.email = $("#email_survey").val();
			objSurvey.experience = $("input[name='experience']:checked").val();
			objSurvey.testdrive_experience = $("input[name='testdrive_experience']:checked").val();
			objSurvey.vehicles = $("input[name='vehicles']:checked").val() == undefined ? $("#other_vehicle").val() : $("input[name='vehicles']:checked").val();
			objSurvey.like = $("#like").val();
			objSurvey.contact = $("input[name='contact']:checked").val();
			objSurvey.time = $("input[name='time']:checked").val();
			objSurvey.model = chkArray.join(',');
			objSurvey.country_id = $("#survey_country").val();
			db.transaction(
					function(tx) {
						dbapp.saveSurvey(tx, objSurvey);
					}
			);
			return false;
		} catch (error) {
			alert("app.saveSurvey " + error);
		}
	},
	loginAuth: function(e) {
		try {
			e.preventDefault();
			//disable the button so we can't resubmit while we wait
			var user = $("#email", this).val();
			var password = $("#password", this).val();
			if (user != '' && password != '') {
				dbapp.auth(user, password);
				setTimeout(function() {
					if (localStorage.status == 'true') {
						setTimeout(app.setLanguage(localStorage.language, false), 1000);
						$.mobile.changePage("#dashboard");
					} else {
						alert("Your login failed");
					}
				}, 50);
			}
			return false;
		} catch (error) {
			alert("loginAuth : " + error);
		}
	},
	isOffline: function() {
		//TODO Disable button Sync 
		$(document).off("click", "#btn_synchro", false);
		$("#btn_synchro").addClass("btn_home_disabled");
		$("#btn_synchro").removeClass("btn_home");
	},
	isOnline: function() {
		$(document).off("click", "#btn_synchro", false);
		$("#btn_synchro").addClass("btn_home_disabled");
		$("#btn_synchro").removeClass("btn_home");

		// Enable button Sync 
		var networkState = navigator.network.connection.type;

		if (networkState == 'wifi') {
			$("#btn_synchro").removeClass("btn_home_disabled");
			$("#btn_synchro").addClass("btn_home");
			if(sendSynchro == false){
				sendSynchro = true;
				$(document).on("click", "#btn_synchro", app.goToSynchro);
			}
			if (appStart == false) {
				appStart = true;
				setTimeout(app.getUsers(), 100);
				setTimeout(app.getModelsAPI(), 100);
			}
		}
	},
	getUsers: function() {
		console.log("Updating users...");
		try {
			$.ajax(urlAPI + "/users/list_users", {
				type: "GET",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(authAPI));
				},
				crossDomain: true,
				contentType: "application/json",
				success: function(data) {
					if (data.status) {
						//$(".synchro_info_txt").append("Resultado de la Consulta : " + data.status);
						dbapp.updateUsers(data.data);
					} else {
						//$(".synchro_info_txt").append("Error al crear el registro : " + data.error);
					}
				},
				error: function(jqXHR, text_status, strError) {
					alert(text_status + " " + strError);
				}
			});
		}
		catch (error)
		{
			alert("getUsers " + error);
		}

	},
	getBookings: function() {
		console.log("Updating bookings...");
		try {
			$.ajax(urlAPI + "/bookings/list", {
				type: "GET",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(authAPI));
				},
				crossDomain: true,
				contentType: "application/json",
				success: function(data) {
					if (data.status) {
						console.log("Resultado de la Consulta : " + data.status);
						dbapp.updateBookings(data.data);
					} else {
						console.log("Error al crear el registro : " + data.error);
					}
				},
				error: function(jqXHR, text_status, strError) {
					alert("getBookings : " + text_status + " " + strError);
				}
			});
		}
		catch (error)
		{
			alert("getBookings " + error);
		}

	},
	getLeads: function() {
		console.log("Updating Leads...");
		try {
			$.ajax(urlAPI + "/leads/list", {
				type: "GET",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(authAPI));
				},
				crossDomain: true,
				contentType: "application/json",
				success: function(data) {
					if (data.status) {
						dbapp.updateLeads(data.data);
					} else {
					}
				},
				error: function(jqXHR, text_status, strError) {
					alert("getLeads : " + text_status + " " + strError);
				}
			});
		}
		catch (error)
		{
			alert("getLeads " + error);
		}

	},
	getSurveys: function() {
		console.log("Updating Surveys...");
		try {
			$.ajax(urlAPI + "/surveys/list", {
				type: "GET",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(authAPI));
				},
				crossDomain: true,
				contentType: "application/json",
				success: function(data) {
					if (data.status) {
						dbapp.updateSurveys(data.data);
					} else {
					}
				},
				error: function(jqXHR, text_status, strError) {
					alert("getSurveys : " + text_status + " " + strError);
				}
			});
		}
		catch (error)
		{
			alert("getSurveys " + error);
		}

	},
	/*
	 getModels: function() {
	 console.log("Updating models...");
	 try {
	 $.ajax(urlAPI + "/models/list", {
	 type: "GET",
	 beforeSend: function(xhr) {
	 xhr.setRequestHeader("Authorization", "Basic " + btoa(authAPI));
	 },
	 crossDomain: true,
	 contentType: "application/json",
	 data: {country: localStorage.country},
	 success: function(data) {
	 if (data.status) {
	 //dbapp.updateBookings(data.data);
	 
	 localStorage.setItem("models", JSON.stringify(data.data));
	 } else {
	 console.log("Error al crear el registro : " + data.error);
	 }
	 },
	 error: function(jqXHR, text_status, strError) {
	 alert(text_status + " " + strError);
	 }
	 });
	 }
	 catch (error)
	 {
	 alert("getUsers " + error);
	 }
	 
	 },
	 */
	getModelsAPI: function() {
		console.log("Updating models...");
		try {
			$.ajax(urlAPI + "/countries/list", {
				type: "GET",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(authAPI));
				},
				crossDomain: true,
				contentType: "application/json",
				success: function(data) {
					if (data.status) {
						dbapp.updateModels(data.data);
					} else {
						console.log("Error al crear el registro : " + data.error);
					}
				},
				error: function(jqXHR, text_status, strError) {
					alert(text_status + " " + strError);
				}
			});
		}
		catch (error)
		{
			alert("getModelsAPI " + error);
		}

	},
	goToFormLead: function() {
		dbapp.queryBookings();
		switch (localStorage.type_registry) {
			case "ON_SITE":
				var $radios = $('input:radio[name=type_registry]');
				if ($radios.is(':checked') === false) {
					$radios.filter('[value=ON_SITE]').prop('checked', true);
				}
				$(".opt_type_registry").hide();
				$(".opt_booking").hide();
				break;
			case "DEALER":
				var $radios = $('input:radio[name=type_registry]');
				if ($radios.is(':checked') === false) {
					$radios.filter('[value=DEALER]').prop('checked', true);
				}
				$(".opt_type_registry").hide();
				$(".opt_booking").show();
				break;
			case "DEALER_AND_ON_SITE":
				$(".opt_type_registry").show();
				break;
		}

		$(':input', '#form_lead')
				.not(':radio, :button, :submit, :reset, :hidden')
				.val('');
		/*
		 $(".ui-radio label").removeClass('ui-btn-active ui-radio-on');
		 $('#current_car_year option, #booking_id option').attr('selected', false);
		 */
		$("#country_id").val(localStorage.country);
		$.mobile.changePage("#register");
	},
	goToFormCheckIn: function() {
		console.log("goToFormCheckIn");
		$.mobile.changePage("#check-in");
	},
	goToSynchro: function() {
		app.enableDisableMenu("false");
		setTimeout(app.getUsers(), 200);
		setTimeout(app.getModelsAPI(), 200);
		setTimeout(dbapp.sendLeads(STATUS_CREATE), 200);
		setTimeout(dbapp.sendLeads(STATUS_CHECK_IN), 200);
		setTimeout(dbapp.sendSurveys(), 200);

		setTimeout(function() {
			if (synchro == 'true') {
				try {
					$.ajax(urlAPI + "/countries/date_timezone/id/" + localStorage.country, {
						type: "GET",
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "Basic " + btoa(authAPI));
						},
						crossDomain: true,
						contentType: "application/json",
						success: function(data) {
							if (data.status) {
								dbapp.updateDateLastSyncro(data.data);
								setTimeout(app.getBookings(), 1000);
								setTimeout(app.getLeads(), 1000);
								setTimeout(app.getSurveys(), 1000);
								sendSynchro = false;
								$(".aviso_confirma").show();

							} else {
								console.log("Error al crear el registro : " + data.error);
							}
						},
						error: function(jqXHR, text_status, strError) {
							alert(text_status + " " + strError);
						}
					});
				}
				catch (error)
				{
					alert("goToSynchro " + error);
				}
			}
		}, 200);

		console.log("goToSynchro");
	},
	goToFormSurvey: function() {
		console.log("goToFormSurvey");
		$("#survey_country").val(localStorage.country);

		dbapp.queryModels();
		$.mobile.changePage("#survey");
	},
	logOut: function() {
		console.log("logOut");
		localStorage.clear();
		localStorage.setItem("status", false);
		window.location.href = "index.html";
		//$.mobile.changePage("#login-page", {reloadPage: true});
	},
	backDashboard: function() {
		console.log("backDashboard");
		$.mobile.changePage("#dashboard");

	},
	hideBooking: function() {
		$('#booking_id option').attr('selected', false);
		$(".opt_booking").hide();
		$("#booking_id").rules("remove");
		$("input[name='type_registry']").rules("remove");
	},
	showBooking: function() {
		$("#booking_id").rules("add", {
			required: true,
			messages: {
				required: i18n.t("translation:register.requiere_booking"),
			}
		});
		$("input[name='type_registry']").rules("add", {
			required: true,
			messages: {
				required: i18n.t("translation:register.requiere_booking"),
			}
		});

		$(".opt_booking").show();
	},
	/*CHECK-IN*/
	loadAutoCompleteLead: function() {
		console.log("loadAutoCompleteLead");
		dbapp.searchLeadCkeckIn();
	},
	scan: function() {
		try {
			var scanner = cordova.require("cordova/plugin/BarcodeScanner");

			scanner.scan(function(result) {

				if (result.format = "QR_CODE") {
					dbapp.searchLeadByQRCode(result.text);
				}
				/*
				 alert("We got a barcode\n" +
				 "Result: " + result.text + "\n" +
				 "Format: " + result.format + "\n" +
				 "Cancelled: " + result.cancelled);
				 */
				console.log(result);

			}, function(error) {
				console.log("Scanning failed: ", error);
			});

		} catch (error) {
			alert(error);
		}

	},
	selectLead: function()
	{
		console.log("selectLead");
		dbapp.searchLeadByEmail($(this).attr('id'));
		$("#searchLead li").addClass("ui-screen-hidden");

	},
	confirmCheckInLead: function() {

		console.log("app.confirmCheckInLead");

		$("#dialog_checkin_title").html(i18n.t("translation:checkin.dialog_checkin_title"));
		$("#dialog_checkin_message").html(i18n.t("translation:checkin.dialog_checkin_message"));
		$("#dialog_checkin_btn_continue").html(i18n.t("translation:checkin.dialog_checkin_button_continue"));
		$("#dialog_checkin_btn_cancel").html(i18n.t("translation:checkin.dialog_checkin_button_cancel"));
		$("#confirmSuccess").trigger("click");

	},
	checkInLead: function() {
		console.log("app.checkInLead");
		$("#list-data-lead").hide();
		dbapp.checkInLead(emailLead, typeRegistry);
	},
	
	enableDisableMenu: function(action){
		if(action == "true"){
			$(document).on("click", "#btn_lead", app.goToFormLead);
			$(document).on("click", "#btn_check_in", app.goToFormCheckIn);
			$(document).on("click", "#btn_synchro", app.goToSynchro);
			$(document).on("click", "#btn_survey", app.goToFormSurvey);
			$(document).on("click", "#btn_logout", app.logOut);
			$("#btn_synchro, #btn_lead, #btn_check_in, #btn_survey").addClass("btn_home");
			$("#btn_synchro, #btn_lead, #btn_check_in, #btn_survey").removeClass("btn_home_disabled");
			$(".aviso_confirma").hide();
		}else{
			$(document).off("click", "#btn_synchro", false);
			$(document).off("click", "#btn_lead", false);
			$(document).off("click", "#btn_check_in", false);
			$(document).off("click", "#btn_survey", false);
			$(document).off("click", "#btn_logout", false);
			$("#btn_synchro, #btn_lead, #btn_check_in, #btn_survey").addClass("btn_home_disabled");
			$("#btn_synchro, #btn_lead, #btn_check_in, #btn_survey").removeClass("btn_home");
		}

	}
	
	
};
