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
        //document.addEventListener('deviceready', this.onDeviceReady, false);
        $(document).on('ready', this.onDeviceReady);
        document.getElementById('scan').addEventListener('click', this.scan, false);
        document.getElementById('send_register').addEventListener('click', this.sendLead, false);
        document.getElementById('query_db').addEventListener('click', dbapp.queryDemo, false);
        document.getElementById('login').addEventListener('submit', this.loginAuth, false);
      
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
        this.checkConnection;
    },

    scan: function() {
        console.log('scanning');
        
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");

        scanner.scan( function (result) { 

            alert("We got a barcode\n" + 
            "Result: " + result.text + "\n" + 
            "Format: " + result.format + "\n" + 
            "Cancelled: " + result.cancelled);  

           console.log("Scanner result: \n" +
                "text: " + result.text + "\n" +
                "format: " + result.format + "\n" +
                "cancelled: " + result.cancelled + "\n");
            document.getElementById("info").innerHTML = result.text;
            console.log(result);

        }, function (error) { 
            console.log("Scanning failed: ", error); 
        } );
    },

    encode: function() {
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");

        scanner.encode(scanner.Encode.TEXT_TYPE, "http://www.audi.com", function(success) {
            alert("encode success: " + success);
          }, function(fail) {
            alert("encoding failed: " + fail);
          }
        );

    },
    
    sendLead: function() {
        $("#info").html("Enviando Lead... ");
        var objLead = {
            country: 1,
            name:"Luis Alberto",
            lastName: "Castillo",
            email: 'a@nettingsolutions.com',
            booking: 2,
            typeCar: 'Renault 4',
            typeRegistry: 'ON_SITE',
            status:1
        };
        try{
            
            $.ajax("http://192.168.0.105/my_first_audi/api/leads/lead/", {
                type: "PUT",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa("admin:1234"));
                },
                crossDomain: true,
                data: JSON.stringify(objLead),
                contentType: "application/json",
                success: function(e) {
                    if(e.status){
                        $("#info").html("Creacion de registro con el ID : " + e.id);
                    }else{
                        $("#info").html("Error al crear el registro : " + e.error);
                    }
                },
                error: function(jqXHR, text_status, strError) {
                    alert(text_status + " " + strError);
                }
            });
        }
        catch(error)
        {
            alert(error);
        }

    },
    
    loginAuth: function(e){
        e.preventDefault();
        //disable the button so we can't resubmit while we wait
        $("#submit",this).attr("disabled","disabled");
        var user = $("#email", this).val();
        var password = $("#password", this).val();
        if(user != '' && password!= '') {
            dbapp.auth(user,password);
            setTimeout(function (){
                if(result) {
                    alert("Login Successfully");
                } else {
                    alert("Your login failed");
                }
                $("#submit").removeAttr("disabled");
            },50);
        }
        return false;
    },
    
    checkConnection : function(reachability) {
        $("#info").html("checkConnection");
        var networkState = navigator.network.connection.type;
        alert(networkState);

        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.NONE]     = 'No network connection';

        alert('Connection type: ' + states[networkState]);
    
    }
    

};
