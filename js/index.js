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
var synchro = false;

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
        setTimeout(function(){
            app.loadActions();
            app.loadAutoCompleteLead();
        },200);
	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		console.log('Received Event: ' + id);
		dbapp.openDatabase();
	},

    setLanguage : function(language, firstTime)
    {
        if(firstTime){
            $.i18n.init(function(t) {
                lng: language;
                $(".login, .general, .register, .survey").i18n();
            });
        }else{
            i18n.setLng(language, function(t) { 
                $(".login, .general, .register, .survey").i18n();
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
        $('.back_to_menu').on('click', app.backDashboard);
        //$('#query').on('click', dbapp.queryDemo);
//        $(document).on('click', '.item-lead a', app.selectLead);
        app.eventsRegistry();
        app.validateLead();
        dbapp.queryBookings();
    },
    eventsRegistry : function(){
        if (localStorage.status == 'true') {
            console.log("eventsRegistry : " + localStorage.status)
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
        }
    },
	scan: function() {
		try {
			var scanner = cordova.require("cordova/plugin/BarcodeScanner");

			scanner.scan(function(result) {

                if(result.format = "QR_CODE"){
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

    validateLead : function(){
        $( "#form_lead" ).validate({
            rules: {
                name: {required: true },
                last_name: {required: true },
                email: {required: true },
                phone: {required: true },
                address: {required: true },
                current_car_brand: {required: true },
                current_car_model: {required: true },
                current_car_year: {required: true },
                model_audi: {required: true }
            },
            messages: {
                email: {required: i18n.t("translation:register.requiere_email") },
                name: {required: i18n.t("translation:register.requiere_name") },
                last_name: {required: i18n.t("translation:register.requiere_last_name") },
                phone: {required: i18n.t("translation:register.requiere_phone") },
                address: {required: i18n.t("translation:register.requiere_address") },
                current_car_brand: {required: i18n.t("translation:register.requiere_brand") },
                current_car_model: {required: i18n.t("translation:register.requiere_model") },
                current_car_year: {required: i18n.t("translation:register.requiere_year") },
                model_audi: {required: i18n.t("translation:register.requiere_model_audi") }
            },
            errorLabelContainer: "#messageErrorLead",
            wrapper: "li",           
            submitHandler: function (form) {
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
            objLead.booking_id = $("#booking_id").val()==""?"NULL":$("#booking_id").val();
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
	},
	isOnline: function() {
		//TODO Enable button Sync 

		var networkState = navigator.network.connection.type;

		if (networkState == 'wifi' && appStart == false) {

			appStart = true;
			setTimeout(app.getUsers(), 100);
            setTimeout(app.getBookings(), 100);
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
						$(".synchro_info_txt").append("Resultado de la Consulta : " + data.status);
						dbapp.updateUsers(data.data);
					} else {
						$(".synchro_info_txt").append("Error al crear el registro : " + data.error);
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
//		$(".synchro_info_txt").append(" Resolution : " + $(window).height() + " - " + $(window).width());
        console.log("goToFormLead");
        $(':input','#form_lead')
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
        dbapp.sendLeads();
        setTimeout(function(){
            if(synchro == true){
                try {
                    $.ajax(urlAPI + "countries/date_timezone/id/" + localStorage.country, {
                        type: "GET",
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader("Authorization", "Basic " + btoa(authAPI));
                        },
                        crossDomain: true,
                        dataType : "jsonp",
                        contentType: "application/json",
                        success: function(data) {
                            if (data.status) {
                                console.log("Resultado de la Consulta : " + data.status);
                                dbapp.updateDateLastSyncro(data.data);
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
        $.mobile.changePage("#survey");
    },
    logOut: function() {
        console.log("logOut");
        localStorage.clear();
        localStorage.setItem("status", false);
        window.location.href = "index.html";
        //$.mobile.changePage("#login-page", {reloadPage: true});
    },

    backDashboard: function(){
        console.log("backDashboard");
        $.mobile.changePage("#dashboard");

    },
    hideBooking : function(){
        $( '#booking_id option').attr('selected', false);
        $( ".opt_booking").hide();
        $( "#booking_id" ).rules( "remove" );
        $( "input[name='type_registry']").rules( "remove" );
    },
    showBooking : function(){
        $( "#booking_id" ).rules( "add", {
            required: true,
            messages: {
                required: i18n.t("translation:register.requiere_booking"),
            }
        });
        $( "input[name='type_registry']").rules( "add", {
            required: true,
            messages: {
                required: i18n.t("translation:register.requiere_booking"),
            }
        });

        $(".opt_booking").show();
    },

    /*CHECK-IN*/
    loadAutoCompleteLead : function(){
        console.log("loadAutoCompleteLead");
        $("#serachLead").html("");
        //dbapp.searchLeadCkeckIn();
    },

    selectLead :function()
    {
        console.log("selectLead");
//        console.log($(this));
    }



};
