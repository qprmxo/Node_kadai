var mysql = require("mysql");

var pool = mysql.createPool({
	connectionLimit : 10,
	host : "localhost",
	user : "root",
	password : "root",
	database : "kadaidb",
	debug : false
});

var insert = function(writer, regdate, content, original, savefile, callback){
	console.log("insert called...");
	
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log("database connect thread id : " + conn.threadId);
		var data = {writer:writer, regdate:regdate, content:content, original:original, savefile:savefile};
		var exec = conn.query("insert into message set ?", data, function(err, result){
			conn.release();
			console.log("SQL : " + exec.sql);
			
			if(err){
				console.log("SQL error occar!");
				console.dir(err);
				callback(err, null);
				return;
			}
			callback(null, result);
		});
	});
};

var msgDelete = function(filename, callback){
	console.log("msgDelete called...");
	
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log("database connection thread id : " + conn.threadId);
		
		var exec = conn.query("delete from message where savefile = ?", filename, function(err, result){
			conn.release();
			console.log("SQL : " + exec.sql);
			
			if(err){
				console.log("SQL error!!");
				console.dir(err);
				callback(err, null);
				return;
			}
			callback(null, result);
		});
	});
};

var list = function(callback){
	console.log("list called...");
	
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log("database connection thread id : " + conn.threadId);
		
		var exec = conn.query("select * from message", function(err, result){
			conn.release();
			console.log('SQL : ' + exec.sql);
			
			if(err){
				console.log("SQL error occar!!");
				console.dir(err);
				
				callback(err, null);
				return;
			}
			callback(null, result);
		});
	});
};

module.exports.msgDelete = msgDelete;
module.exports.insert = insert;
module.exports.list = list;