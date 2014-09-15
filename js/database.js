/**
 * @author Luis Castillo
 */

// global variables
var db;
var shortName = 'myFirstAudiDB';
var version = '';
var displayName = 'My First AUDI';
var maxSize = 2000000;

var dbapp = {
        
    openDatabase : function(){
        db = window.openDatabase(shortName, version, displayName, maxSize);
    },

    queryDemo : function () {
        db.transaction(dbapp.queryDB);
    },
    
    queryDB : function (tx) {
        tx.executeSql('SELECT * FROM USERS', [], dbapp.querySuccess, dbapp.errorCB);
    },
    
    querySuccess : function (tx, results) {
        $('#info').html("querySuccess");
        var s = "";
        if (results != null && results.rows != null) {
            for(var i=0; i<results.rows.length; i++) {
                s += "<li><a href='edit.html?id="+results.rows.item(i).id + "'>" + results.rows.item(i).data + "</a></li>"; 
            }
            $("#info").html(s);
        }else{
            console.log("null");
        }
        // this will be empty since no rows were inserted.
        console.log(results);
    },
    // Populate the database 
    //
    populateDB : function (tx) {
         tx.executeSql('CREATE TABLE IF NOT EXISTS Users(' + 
                        'id INTEGER NOT NULL PRIMARY KEY, ' +
                        'country_id INTEGER NOT NULL, ' +
                        'profile_id INTEGER NOT NULL, ' +
                        'name TEXT NOT NULL' +
                        'last_name TEXT NOT NULL' +
                        'email TEXT NOT NULL' +
                        'password TEXT NOT NULL' +
                        'language TEXT NOT NULL');
         tx.executeSql('INSERT INTO Users (id, country_id, profile_id, name, ' +
                       'last_name, email, password, language) ' + 
                       ' VALUES (1, 1, 1, "Admin", "Admin", "admin@admin.com",'+
                       '"21232f297a57a5a743894a0e4a801fc3", "ENGLISH")');
    },

    // Transaction error callback
    //
    errorCB : function (tx, err) {
        alert("Error processing SQL: "+err);
    },

    // Transaction success callback
    //
    successCB :function () {
        console.log("success!");
    },
    
    //login users
    auth: function(user, pass){
        tx.executeSql('SELECT * FROM Users WHERE email = ? AND password = ?',
                      [user, md5(pass)], 
                      dbapp.authSuccess,
                      dbapp.errorauth
        );
    },
    
    authSuccess : function(){
        return true;
    },
    
    errorauth : function(){
        return false;
    }
};
