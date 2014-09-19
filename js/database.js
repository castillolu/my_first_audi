/**
 * @author Luis Castillo
 */

// global variables
var db = null;
var shortName = 'DB_MYAUDI.sqllite';
var version = '1.0';
var displayName = 'DB_My_First_AUDI';
var maxSize = 2097152;
var result = false;


var dbapp = {
        
    openDatabase : function(){
        console.log("before");
        try{
            db = window.openDatabase(shortName, version, displayName, maxSize);
        }catch(error){
            alert(error);
        }
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
        $("#info").append("Error processing SQL: "+err);
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

    errorSearchUser : function (transaction, error)
    {
        // error.message is a human-readable string.
        // error.code is a numeric error code
        alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
     
        result = false;
    },
     
    successSearchUser : function (transaction, results, objUser)
    {
        if(results.rows.length > 0){
            db.transaction(function(tx){
                    dbapp.updateUserDB(tx, objUser);
                },
                dbapp.successCB, 
                dbapp.errorCB
            );
        }else{
            db.transaction(function(tx){
                    dbapp.createUserDB(tx, objUser);
                },
                dbapp.successCB, 
                dbapp.errorCB
            );
        }
    },
    
    //Update users from BD PHP
    updateUsers : function(users){
        $("#info").append("Update user each per each");
        try{
            for(var user in users){
                dbapp.searchUserDB(users[user]);
            }
        }catch(error){
            alert(error);
        }
    },

    
    searchUserDB : function(objUser){
        result = false;

        db.transaction(
            function(tx){
                try{
                        tx.executeSql('SELECT * FROM Users WHERE id = ?',
                            [objUser.id],
                            function(tx, result){
                                dbapp.successSearchUser(tx, result, objUser)
                            },
                            dbapp.errorSearchUser);
                }catch(error) {
                    alert("Line 140 : " + error);
                }
            }
        );
    },
    
    updateUserDB : function(tx, objUser){
        var sql = 'UPDATE Users SET country_id = ' + objUser.country_id + ', ' + 
                        'profile_id = ' + objUser.profile_id + ', ' +
                        'name = "' + objUser.name + '", ' +
                        'last_name = "' + objUser.last_name + '"' +', ' +
                        'email = "' + objUser.email + '"' + ', ' +
                        'password = "' + objUser.password + '"' + ', ' + 
                        'language = "' + objUser.language + '" ' +  
                        'WHERE id = ' + objUser.id;
        
        tx.executeSql(sql,[], function(){$("#info").append("Update : " + sql);}, dbapp.errorHandler);
    },
    
    createUserDB : function(tx, objUser){
        var sql = 'INSERT INTO Users (id, country_id, profile_id, name, ' +
                        'last_name, email, password, language) ' + 
                        ' VALUES (' + 
                        objUser.id + 
                        ', ' + objUser.country_id + 
                        ', ' + objUser.profile_id + 
                        ', "' + objUser.name + '"' + 
                        ', "' + objUser.last_name + '"' + 
                        ', "' + objUser.email + '"' + 
                        ', "' + objUser.password + '"' + 
                        ', "' + objUser.language + '")';
                        
        $("#info").append("Insert : " + sql + "\n\n");
        tx.executeSql(sql,[], function(){$("#info").append("Insert : " + sql);}, dbapp.errorHandler);
    }
};
