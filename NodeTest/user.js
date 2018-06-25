var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit : 10,
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'kadaidb',
	debug : false
});

var authUser = function(id, password, callback){
	console.log('authUser called...');
	
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log('database connect thread id : ' + conn.threadId);
		
		var columns = ['id', 'name', 'age'];
		var tablename = 'users';
		
		var exec = conn.query("select ?? from ?? where id = ? and password = ?", [columns, tablename, id, password], function(err, rows){
			conn.release();
			console.log('SQL : ' + exec.sql);
			
			if(rows.length > 0){
				console.log('ID [%s], Password [%s] Ok : ', id, password);
				callback(null, rows);
			}else{
				console.log('incorrect user...');
				callback(null, null);
			}
		});
	});
};

var addUser = function(id, name, age, password, callback){
	console.log('addUser called...');
	
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			
			callback(err, null);
			return;
		}
		console.log('database connection thread id : ' + conn.threadId);
		
		var data = {id:id, name:name, age:age, password:password};
		
		var exec = conn.query('insert into users set ?', data, function(err, result){
			conn.release();
			console.log('SQL : ' + exec.sql);
			
			if(err){
				console.log('SQL error occar!!');
				console.dir(err);
				
				callback(err, null);
				
				return;
			}
			callback(null, result);
		});
	});
};

var findAll = function(callback){
	console.log('findAll call...');
	
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			
			callback(err, null);
			return;
		}
		console.log('database connection thread id : ' + conn.threadId);
		
		var exec = conn.query('select * from users', function(err, result){
			conn.release();
			console.log('SQL : ' + exec.sql);
			
			if(err){
				console.log('SQL error occar!!');
				console.dir(err);
				
				callback(err, null);
				
				return;
			}
			callback(null, result);
		});
	});
};

var findUser = function(id, callback){
	console.log("findUser called...");
	
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log('database connection thread id : ' + conn.threadId);
		
		var data = {id:id};
		
		var exec = conn.query('select * from users where ?', data, function(err, result){
			conn.release();
			console.log('SQL : ' + exec.sql);
			
			if(err){
				console.log('SQL error occar!!');
				console.dir(err);
				
				callback(err, null);
				return;
			}
			callback(null, result);
		});
	});
};

var updateUser = function(id, name, age, password, callback){
	console.log('updateUser called...');
	
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log('database connection thread id : ' + conn.threadId);
		var data = {name:name, age:age, password:password};
		var exec = conn.query('update users set ? where id = ?', [data, id], function(err, result){
			conn.release();
			console.log('SQL : ' + exec.sql);
			
			if(err){
				console.log('SQL error occar!!');
				console.dir(err);
				
				callback(err, null);
				return;
			}
			callback(null, result);
		});
	});
};

var deleteUser = function(id, callback){
	console.log('deleteUser called...');
	
	pool.getConnection(function(err, conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err, null);
			return;
		}
		console.log('database connection thread id :' + conn.threadId);
		
		var data = {id:id};
		
		var exec = conn.query('delete from users where ?', data, function(err, result){
			conn.release();
			console.log('SQL : ' + exec.sql);
			
			if(err){
				console.log('SQL error occar!!');
				console.dir(err);
				
				callback(err, null);
				return;
			}
			callback(null, result);
		});
	});
};

module.exports.authUser = authUser;
module.exports.addUser = addUser;
module.exports.findAll = findAll;
module.exports.findUser = findUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;