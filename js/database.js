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
        $('#info').html("queryDemo");
        db.transaction(dbapp.queryDB);
        $('#info').html("queryDemo");
    },
    
    queryDB : function (tx) {
        $('#info').html("queryDB");
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
         tx.executeSql('CREATE TABLE IF NOT EXISTS USERS (id unique, data)');
         tx.executeSql('INSERT INTO USERS (id, data) VALUES (1, "First row")');
         tx.executeSql('INSERT INTO USERS (id, data) VALUES (2, "Second row")');
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
    }
};
