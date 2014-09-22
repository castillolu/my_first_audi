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
//        document.getElementById('scan').addEventListener('click', this.scan, false);
//        document.getElementById('send_register').addEventListener('click', this.sendLead, false);
//        document.getElementById('query_db').addEventListener('click', dbapp.queryDemo, false);
		document.getElementById('login').addEventListener('submit', this.loginAuth, false);
		document.addEventListener("offline", this.isOffline, false);
		document.addEventListener("online", this.isOnline, false);
		setTimeout(function() {
			$.i18n.init(function(t) {
				lng: language;
				$(".login, .general, .register").i18n();
			});
		}, 100);
	},
	// deviceready Event Handler
	//
	// The scope of `this` is the event. In order to call the `receivedEvent`
	// function, we must explicity call `app.receivedEvent(...);`
	onDeviceReady: function() {
		app.receivedEvent('deviceready');
		app.loadContent();
		setTimeout(app.loadActions, 50);
	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		console.log('Received Event: ' + id);
		dbapp.openDatabase();
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
		if (localStorage.status) {
			$.mobile.changePage("#dashboard");
		}

	},
	loadActions: function() {
		$('#btn_lead').on('click', app.goToFormLead);
		$('#btn_check_in').on('click', app.goToFormCheckIn);
		$('#btn_synchro').on('click', app.goToSynchro);
		$('#btn_survey').on('click', app.goToFormSurvey);
		$('#btn_logout').on('click', app.logOut);
		if (localStorage.status) {
			$(".synchro_info_txt").html(localStorage.last_name);
			$(".synchro_info_txt").append(localStorage.email);
			$("#country_id").val(localStorage.country);
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
			dbapp.queryBookings();
		}
	},
	scan: function() {
		try {
			var scanner = cordova.require("cordova/plugin/BarcodeScanner");

			scanner.scan(function(result) {

				alert("We got a barcode\n" +
						"Result: " + result.text + "\n" +
						"Format: " + result.format + "\n" +
						"Cancelled: " + result.cancelled);

				document.getElementById("info").innerHTML = result.text;
				console.log(result);

			}, function(error) {
				console.log("Scanning failed: ", error);
			});

		} catch (error) {
			alert(error);
		}

	},
	sendLead: function() {
		var objLead = {
			country: 1,
			name: "Luis Alberto",
			lastName: "Castillo",
			email: 'a@nettingsolutions.com',
			booking: 2,
			typeCar: 'Renault 4',
			typeRegistry: 'ON_SITE',
			status: 1
		};
		try {

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
						$("#info").html("Creacion de registro con el ID : " + e.id);
					} else {
						$("#info").html("Error al crear el registro : " + e.error);
					}
				},
				error: function(jqXHR, text_status, strError) {
					alert(text_status + " " + strError);
				}
			});
		}
		catch (error)
		{
			alert(error);
		}

	},
	loginAuth: function(e) {
		try {
			e.preventDefault();
			//disable the button so we can't resubmit while we wait
			$("#submit", this).attr("disabled", "disabled");
			var user = $("#email", this).val();
			var password = $("#password", this).val();
			if (user != '' && password != '') {
				dbapp.auth(user, password);
				setTimeout(function() {
					if (localStorage.status) {
						$(".synchro_info_txt").html(localStorage.last_name);
						$(".synchro_info_txt").append(localStorage.email);
						$.mobile.changePage("#dashboard")
					} else {
						alert("Your login failed");
					}
					$("#submit").removeAttr("disabled");
				}, 50);
			}
			return false;
		} catch (error) {
			alert(error);
		}
	},
	isOffline: function() {
		//TODO Disable button Sync 
	},
	isOnline: function() {
		//TODO Enable button Sync 
		var networkState = navigator.network.connection.type;

		if (networkState == 'wifi' && appStart == false) {

			appStart = true;
			setTimeout(app.getUsers(), 100);
		}

	},
	getUsers: function() {
		$("#info").html("Updating users...");
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
						$("#info").append("Resultado de la Consulta : " + data.status);
						dbapp.updateUsers(data.data);
					} else {
						$("#info").append("Error al crear el registro : " + data.error);
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
		$("#info").html("Updating bookings...");
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
						$("#info").append("Resultado de la Consulta : " + data.status);
						dbapp.updateBookings(data.data);
					} else {
						$("#info").append("Error al crear el registro : " + data.error);
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
	goToFormLead: function() {
		console.log("goToFormLead");
		$.mobile.changePage("#register");
	},
	goToFormCheckIn: function() {
		console.log("goToFormCheckIn");
		$.mobile.changePage("#check-in");
	},
	goToSynchro: function() {
		console.log("goToSynchro");
	},
	goToFormSurvey: function() {
		console.log("goToFormSurvey");
		$.mobile.changePage("#survey");
	},
	logOut: function() {
		console.log("logOut");
		localStorage.clear();
		$.mobile.changePage("#login-page", {reloadPage: true});
	}
};
