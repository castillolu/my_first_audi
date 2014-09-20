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
		document.addEventListener('deviceready', this.onDeviceReady, false);
		//$(document).on('ready', this.onDeviceReady);
//        document.getElementById('scan').addEventListener('click', this.scan, false);
//        document.getElementById('send_register').addEventListener('click', this.sendLead, false);
//        document.getElementById('query_db').addEventListener('click', dbapp.queryDemo, false);
		document.getElementById('login').addEventListener('submit', this.loginAuth, false);
		document.addEventListener("offline", this.isOffline, false);
		document.addEventListener("online", this.isOnline, false);
		$.i18n.init(function(t) {
			lng: language;
			$(".login").i18n();
		});

	},
	// deviceready Event Handler
	//
	// The scope of `this` is the event. In order to call the `receivedEvent`
	// function, we must explicity call `app.receivedEvent(...);`
	onDeviceReady: function() {
		app.receivedEvent('deviceready');
	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		console.log('Received Event: ' + id);
		dbapp.openDatabase();
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
				setTimeout(function(result) {
					if (result.status) {
						alert("Login Successfully");
						$("#synchro_info_txt").html(localStorage.lastname);
						$("#synchro_info_txt").append(localStorage.email);
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

		$("#info").html(networkState);
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
			alert(error);
		}

	}


};
