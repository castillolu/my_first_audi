/**
 * @author Luis Castillo
 */

// global variables
var db;
var shortName = 'DB_MYAUDI.sqllite';
var version = '1.0';
var displayName = 'DB_My_First_AUDI';
var maxSize = 2097152;
var result = false;
var objUser = {};

var dbapp = {
        
    openDatabase : function(){
        console.log("before");
        db = window.openDatabase(shortName, version, displayName, maxSize);
        db.transaction(dbapp.populateDB, dbapp.successCB, dbapp.errorCB);
        console.log("after");
    },

    queryDemo : function () {
        db.transaction(dbapp.queryDB);
    },
    
    queryDB : function (tx) {
        console.log("consulta");
        tx.executeSql('SELECT * FROM Users', [], dbapp.querySuccess, dbapp.errorCB);
    },
    
    querySuccess : function (tx, results) {
        console.log("querySuccess");
        $('#info').html("querySuccess");
        
        var s = "";
        if (results != null && results.rows != null) {
            for(var i=0; i<results.rows.length; i++) {
                s += "<li><a href='edit.html?id="+results.rows.item(i).id + "'>" + results.rows.item(i).name + "</a></li>"; 
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
        console.log("create");
        tx.executeSql('CREATE TABLE IF NOT EXISTS Users(' + 
                        'id INTEGER NOT NULL PRIMARY KEY, ' +
                        'country_id INTEGER NOT NULL, ' +
                        'profile_id INTEGER NOT NULL, ' +
                        'name TEXT NOT NULL,' +
                        'last_name TEXT NOT NULL,' +
                        'email TEXT NOT NULL,' +
                        'password TEXT NOT NULL,' +
                        'language TEXT NOT NULL)');
        tx.executeSql('INSERT INTO Users (id, country_id, profile_id, name, ' +
                        'last_name, email, password, language) ' + 
                        ' VALUES (1, 1, 1, "Admin", "Admin", "admin@admin.com",'+
                        '"21232f297a57a5a743894a0e4a801fc3", "ENGLISH")');
    },

    // Transaction error callback
    //
    errorCB : function (tx, err) {
        console.log(err);
        alert("Error processing SQL: "+err);
    },

    // Transaction success callback
    //
    successCB :function () {
        console.log("success!");

    },
    
    //login users
    auth: function(user, pass){
        db.transaction(
            function(tx){
                tx.executeSql('SELECT * FROM Users WHERE password = ? AND email = ?',
                    [md5(pass), user], 
                    dbapp.dataHandler,
                    dbapp.errorHandler);
            }
        );
        return result;
    },
        
    errorHandler : function (transaction, error)
    {
        // error.message is a human-readable string.
        // error.code is a numeric error code
        alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
     
        result = false;
    },
     
    dataHandler : function (transaction, results)
    {
        if(results.rows.length > 0){
            result = true;
        }else{
            result = false;
        }
    },
    
    //Update users from BD PHP
    updateUsers : function(users){
        $("#info").html("Update user each per each");
        try{
            for(var user in users){
                objUser.id = users[user].id;
                objUser.country_id = users[user].country.id;
                objUser.profile_id = users[user].profile.id;
                objUser.name = users[user].name;
                objUser.last_name = users[user].last_name;
                objUser.email = users[user].email;
                objUser.password = users[user].password;
                objUser.language = users[user].country.language;
                db.transaction(dbapp.searchUserDB, dbapp.successCB, dbapp.errorCB);
            }
        }catch(error){
            alert(error);
        }
    },
    
    searchUserDB : function(){
        result = false;
        db.transaction(
            function(tx){
                tx.executeSql('SELECT * FROM Users WHERE id = ?',
                    [objUser.id], 
                    dbapp.dataHandler,
                    dbapp.errorHandler);
            }
        );
        if(result){
            db.transaction(dbapp.updateUserDB, dbapp.successCB, dbapp.errorCB);
        }else{
            db.transaction(dbapp.createUserDB, dbapp.successCB, dbapp.errorCB);
        }   
        
    },
    
    updateUserDB : function(){
        tx.executeSql('UPDATE Users SET country_id = ' + objUser.country_id + ', ' + 
                        'profile_id = ' + objUser.profile_id + ', ' +
                        'name = "' + objUser.name + '", ' +
                        'last_name = "' + objUser.last_name + '"' +', ' +
                        'email = "' + objUser.email + '"' + ', ' +
                        'password = "' + objUser.password + '"' + ', ' + 
                        'language = "' + objUser.language + '" ' +  
                        'WHERE id = ' + objUser.id);
    },
    
    createUserDB : function(){
        tx.executeSql('INSERT INTO Users (id, country_id, profile_id, name, ' +
                        'last_name, email, password, language) ' + 
                        ' VALUES (' + 
                        objUser.id + 
                        ', ' + objUser.country_id + 
                        ', ' + objUser.profile_id + 
                        ', "' + objUser.name + '"' + 
                        ', "' + objUser.last_name + '"' + 
                        ', "' + objUser.email + '"' + 
                        ', "' + objUser.password + '"' + 
                        ', "' + objUser.language + '")');
    }
};
