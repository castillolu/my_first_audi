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

//TYPE REGISTRY
var TYPE_REGISTRY_ONSITE  = "ON_SITE";
var TYPE_REGISTRY_DEALER  = "DEALER";
var TYPE_REGISTRY_BOTH    = "DEALER_AND_ON_SITE";

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
			document.addEventListener('deviceready', app.onDeviceReady, false);
		} else {
			$(document).on('ready', app.onDeviceReady);
		}
		setTimeout(app.setLanguage(language, true), 1000);
		$(document).ajaxError(function(event, request, settings) {
			console.log("Error requesting page " + settings.url);
		});
	},
	// deviceready Event Handler
	//
	// The scope of `this` is the event. In order to call the `receivedEvent`
	// function, we must explicity call `app.receivedEvent(...);`
	onDeviceReady: function() {
		console.log("onDeviceReady");
		app.receivedEvent('deviceready');
		app.loadContent();
		setTimeout(function() {
			app.loadActions();
		}, 1000);
	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		console.log('Received Event: ' + id);
		dbapp.openDatabase();
	},
	setLanguage: function(language, firstTime)
	{
		if (firstTime) {
			var options = {
				resGetPath: 'languages/__lng__/__ns__.json',
				lng: language
			};
			$.i18n.init(options);
			i18n.setLng(language, function(t) {
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
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			if ((navigator.network.connection.type).toUpperCase() != "NONE" &&
					(navigator.network.connection.type).toUpperCase() != "UNKNOWN") {
				app.isOnline();
			}else{
				app.isOffline();
			}
		}

		document.addEventListener("backbutton", app.blockBackButton, false);
		document.addEventListener("online", app.isOnline, false);
		document.addEventListener("offline", app.isOffline, false);		

		$('#login').on('submit', app.loginAuth);
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
		$("#close_message").on('click', function(){
			app.enableDisableMenu(true);
		});
		$('.back_to_menu').on('click', app.backDashboard);
		$(document).on('click', 'ul#searchLead li a', app.selectLead);
		$("#list-data-lead").hide();
		$(".aviso_confirma").hide();
		 if (/iPad/i.test(navigator.userAgent)) {
			$('.synchro').addClass("synchro_ipad");
		 }
		app.validateLead();
		app.validateSurvey();
		app.getLastUpdate();
	},
	blockBackButton : function(e){
	    if($.mobile.activePage.is('#login_page')){
	        e.preventDefault();
	    }
	    else {
	        if (confirm(i18n.t("translation:login.confirm_logout"))) {
	            /* Here is where my AJAX code for logging off goes */
	            app.logOut();
	        }
	        else {
	            return false;
	        }
	    }
	},
	validateLead: function() {
		console.log("validateLead");
		$("#form_lead").validate({
			rules: {
				type_registry: {required: true},
				name: {required: true},
				last_name: {required: true},
				email_lead: {
					required: true,
					email: true
				},
				phone: {required: true},
				address: {required: true},
				current_car_brand: {required: true},
				current_car_model: {required: true},
				current_car_year: {required: true},
				model_audi: {required: true}
			},
			messages: {
				type_registry: {required: i18n.t("translation:register.requiere_type_registry")},
				name: {required: i18n.t("translation:register.requiere_name")},
				last_name: {required: i18n.t("translation:register.requiere_last_name")},
				email_lead: {
					required: i18n.t("translation:register.requiere_email"),
					email : i18n.t("translation:register.valid_email")
				},
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
		console.log("validateSurvey");
		$("#form_survey").validate({
			rules: {
				experience: {required: true},
				email_survey: {required: true, email: true},
				testdrive_experience: {required: true},
				like: {required: true},
				contact: {required: true},
				time: {required: true}
			},
			messages: {
				email_survey: {required: i18n.t("translation:register.requiere_email"), email : i18n.t("translation:register.valid_email")},
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
		console.log("app.saveSurvey");
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
				console.log("Before dbapp.auth - Status = " + localStorage.status);
				dbapp.auth(user, password);
				setTimeout(function() {
					console.log("Before If Status = " + localStorage.status);
					if (localStorage.status == 'true') {
						setTimeout(app.setLanguage(localStorage.language, false), 1000);
						$.mobile.changePage("#dashboard");
						switch(localStorage.type_registry){
							case TYPE_REGISTRY_ONSITE:
								app.hideBooking();
								break;
							case TYPE_REGISTRY_DEALER:
								app.showBooking();
								break;
							case TYPE_REGISTRY_BOTH:
								app.addRequiredRegister();
								break;
						}
					} else {
						$("#dialog_title").html(i18n.t("translation:general.dialog_login_title"));
						$("#dialog_message").html(i18n.t("translation:general.dialog_login_message"));
						$("#dialog_btn").html(i18n.t("translation:general.dialog_lead_exist_button"));
						$("#leadSuccess").trigger("click");
					}
				}, 200);
			}
			return false;
		} catch (error) {
			alert("loginAuth : " + error);
		}
	},
	getLastUpdate: function() {
		console.log("getLastUpdate");
		dbapp.queryLastUpdate();
	},
	isOffline: function() {
		//TODO Disable button Sync 
		$("#btn_synchro").prop({disabled: true});
		$("#btn_synchro").addClass("btn_home_disabled");
		$("#btn_synchro").removeClass("btn_home");
	},
	isOnline: function() {
		$("#btn_synchro").prop({disabled: false});
		$("#btn_synchro").addClass("btn_home_disabled");
		$("#btn_synchro").removeClass("btn_home");

		// Enable button Sync 
		var networkState = navigator.network.connection.type;
		console.log("isOnline");
		console.log(networkState);

		if (networkState == 'wifi') {
			$("#btn_synchro").removeClass("btn_home_disabled");
			$("#btn_synchro").addClass("btn_home");
			if (sendSynchro == false) {
				sendSynchro = true;
				$("#btn_synchro").prop({disabled: true});
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
					if (data.status == true) {
						//$(".synchro_info_txt").append("Resultado de la Consulta : " + data.status);
						dbapp.updateUsers(data.data);
					} else {
						console.log("Error al crear users : " + data.error);
					}
				},
				error: function(jqXHR, text_status, strError) {
					var messageError = "getUsers : "+ jqXHR.status + " - " +text_status + " - " + strError;						
					messageError = i18n.t("translation:general.message_error", {messageError: messageError});
					alert(messageError);
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
					console.log(data.status);
					if (data.status == true) {
						console.log("Resultado de la Consulta booking : " + data.status);
						dbapp.updateBookings(data.data);
					} else {
						console.log("Error al crear el booking : " + data.error);
					}
				},
				error: function(jqXHR, text_status, strError) {
					var messageError = "getBookings : "+ jqXHR.status + " - " +text_status + " - " + strError;						
					messageError = i18n.t("translation:general.message_error", {messageError: messageError});
					alert(messageError);
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
					if (data.status == true) {
						dbapp.updateLeads(data.data);
					} else if (data.status == "false") {
						alert('Sin datos');
					}
				},
				error: function(jqXHR, text_status, strError) {
					var messageError = "getLeads : "+ jqXHR.status + " - " +text_status + " - " + strError;						
					messageError = i18n.t("translation:general.message_error", {messageError: messageError});
					alert(messageError);
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
					if (data.status == true) {
						dbapp.updateSurveys(data.data);
					} else {
					}
				},
				error: function(jqXHR, text_status, strError) {
					var messageError = "getSurveys : "+ jqXHR.status + " - " +text_status + " - " + strError;						
					messageError = i18n.t("translation:general.message_error", {messageError: messageError});
					alert(messageError);
				}
			});
		}
		catch (error)
		{
			alert("getSurveys " + error);
		}

	},
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
					if (data.status == true) {
						dbapp.updateModels(data.data);
					} else {
						console.log("Error al crear models : " + data.error);
					}
				},
				error: function(jqXHR, text_status, strError) {
					var messageError = "getModelsAPI : "+ jqXHR.status + " - " +text_status + " - " + strError;						
					messageError = i18n.t("translation:general.message_error", {messageError: messageError});
					alert(messageError);
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
		$("#list-data-lead").hide();
		$("#btn_check_in_end").hide();
		app.loadAutoCompleteLead();
		$.mobile.changePage("#check-in");
	},
	goToSynchro: function() {
		app.enableDisableMenu(false);

	    $.mobile.loading( "show", {
	            text: i18n.t("translation:general.synchronizing"),
	            textVisible: true,
	            theme: "b",
	            textonly: false,
	            html: ""
	    });		
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
							if (data.status == true) {
								dbapp.updateDateLastSyncro(data.data);
								setTimeout(app.getBookings(), 500);
								setTimeout(app.getLeads(), 500);
								setTimeout(app.getSurveys(), 500);
								sendSynchro = false;
								$(".aviso_confirma").show();
								$.mobile.loading( "hide" );

							} else {
								console.log("Error al crear el lastupdate : " + data.error);
							}
						},
						error: function(jqXHR, text_status, strError) {
							var messageError = jqXHR.status + " - " +text_status + " - " + strError;						
							messageError = i18n.t("translation:general.message_error", {messageError: messageError});
							alert(messageError);
						}
					});
				}
				catch (error)
				{
					alert("goToSynchro " + error);
				}
			}
		}, 1000);

		console.log("goToSynchro");
	},
	goToFormSurvey: function() {
		console.log("goToFormSurvey");
		$("#survey_country").val(localStorage.country);
		$.mobile.changePage("#survey");
		setTimeout(function(){
			dbapp.queryModels();
		},1000)
	},
	logOut: function() {
		console.log("logOut");
		localStorage.clear();
		localStorage.setItem("status", false);
		window.location.href = "index.html";
	},
	backDashboard: function() {
		console.log("backDashboard");
		$.mobile.changePage("#dashboard");

	},
	hideBooking: function() {
		console.log("hideBooking");
		$('#booking_id option').attr('selected', false);
		$(".opt_booking").hide();
		$("#booking_id").rules("remove");
		$("input[name='type_registry']").rules("remove");
	},
	showBooking: function() {
		console.log("showBooking");
		$("#booking_id").rules("add", {
			required: true,
			messages: {
				required: i18n.t("translation:register.requiere_booking"),
			}
		});
		$("input[name='type_registry']").rules("add", {
			required: true,
			messages: {
				required: i18n.t("translation:register.requiere_type_registry"),
			}
		});

		$(".opt_booking").show();
	},

	addRequiredRegister: function(){
		console.log("addRequiredRegister");
		$("input[name='type_registry']").rules("add", {
			required: true,
			messages: {
				required: i18n.t("translation:register.requiere_type_registry"),
			}
		});
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
		$("#dialog_checkin_message").html(i18n.t("translation:checkin.dialog_checkin_message", {Name: nameLead}));

		$("#dialog_checkin_btn_continue").html(i18n.t("translation:checkin.dialog_checkin_button_continue"));
		$("#dialog_checkin_btn_cancel").html(i18n.t("translation:checkin.dialog_checkin_button_cancel"));
		$("#confirmSuccess").trigger("click");

	},
	checkInLead: function() {
		console.log("app.checkInLead");
		$("#list-data-lead").hide();
		dbapp.checkInLead(emailLead, typeRegistry);
	},
	enableDisableMenu: function(action) {
		if (action == true) {
			$("#btn_lead, #btn_check_in, #btn_synchro, #btn_survey, #btn_logout").prop({disabled: false});
			$("#btn_synchro, #btn_lead, #btn_check_in, #btn_survey").addClass("btn_home");
			$("#btn_synchro, #btn_lead, #btn_check_in, #btn_survey").removeClass("btn_home_disabled");
			$(".aviso_confirma").hide();
		} else {
			$("#btn_lead, #btn_check_in, #btn_synchro, #btn_survey, #btn_logout").prop({disabled: true});
			$("#btn_synchro, #btn_lead, #btn_check_in, #btn_survey").addClass("btn_home_disabled");
			$("#btn_synchro, #btn_lead, #btn_check_in, #btn_survey").removeClass("btn_home");
		}
	}
};
