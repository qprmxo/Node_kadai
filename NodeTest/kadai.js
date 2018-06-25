var oracledb = require("oracledb");
var dbConfig = require("./dbconfig.js");

var login = function(id, pwd, callback){
	console.log("login called...");
	oracledb.getConnection(dbConfig, function(err, conn){
		if(err){
			console.error(err.message);
			callback(err, null);
			return;
		}
		console.log("id : " + id);
		conn.execute("select * from user1 where id=:id", [id], function(err, result){
			conn.close();
			if(err){
				console.error(err.message);
				return;
			}
			console.log(result.rows.length);
			if(result.rows.length > 0){
				if(pwd === result.rows[0][1]){
					callback(null, "true");
				}else{
					callback(null, "false");
				}
			}else{
				callback(null, "会員が存在しません。");
			}
		});
	});	
};

var idCheck = function(id, callback){
	console.log("idCheck called...");
	oracledb.getConnection(dbConfig, function(err, conn){
		if(err){
			console.error(err.message);
			callback(err, null);
			return;
		}
		conn.execute("select * from user1 where id=:id", [id], function(err, result){
			console.log("execute ok!!");
			conn.close();
			if(err){
				console.error(err.message);
				callback(err, null);
				return;
			}
			console.log(result.rows.length);
			if(result.rows.length > 0){
				callback(null, "false");
			}else{
				callback(null, "true");
			}
		});
	});
};

var userInsert = function(id, pass, name, kana, birth, club, callback){
	console.log("userInsert called...");
	oracledb.getConnection(dbConfig, function(err, conn){
		if(err){
			console.error(err.message);
			callback(err, null);
			return;
		}
		conn.execute("insert into user1 values(:id, :pass, :name, :kana)", [id, pass, name, kana], function(err, result){
			console.log("execute ok!!");
			if(err){
//				conn.close();
				console.error(err.message);
				callback(err, null);
				return;
			}
			console.log(birth);
			conn.execute("insert into userdetail values(seq_no.nextval, :id, :birth, :club)", [id, birth, club], function(err, result){
				if(err){
//					conn.close();
					console.error(err.message);
					callback(err, null);
					return;
				}
				conn.commit();
//				conn.close();
				callback(null, result);
			});
		});
	});
};

var userDelete = function(id, callback){
	console.log("userDelete called...");
	console.log("delete id : " + id);
	oracledb.getConnection(dbConfig, function(err, conn){
		if(err){
			console.error(err.message);
			callback(err, null);
			return;
		}
		conn.execute("delete from userdetail where id=:id", [id], function(err, result){
			console.log("execute ok!!");
			if(err){
//				conn.close();
				console.error(err.message);
				callback(err, null);
				return;
			}
			conn.execute("delete from user1 where id=:id", [id], function(err, result){
				if(err){
//					conn.close();
					console.error(err.message);
					callback(err, null);
					return;
				}
				conn.commit();
//				conn.close();
				callback(null, result);
			});
		});
	});
};

var userUpdate = function(id, name, kana, birth, club, callback){
	console.log("userUpdate called...");
	oracledb.getConnection(dbConfig, function(err, conn){
		if(err){
			console.error(err.message);
			callback(err, null);
			return;
		}
		conn.execute("update userdetail set birth=:birth, club=:club where id=:id", [birth, club, id], function(err, result){
			if(err){
//				conn.close();
				console.error(err.message);
				callback(err, null);
				return;
			}
			conn.execute("update user1 set name=:name, kana=:kana where id=:id", [name, kana, id], function(err, result){
				if(err){
//					conn.close();
					console.error(err.message);
					callback(err, null);
					return;
				}
				conn.commit();
//				conn.close();
				callback(null, result);
			});
		});
	});
};

var userFind = function(id, callback){
	console.log("userFind called...");
	oracledb.getConnection(dbConfig, function(err, conn){
		if(err){
			console.error(err.message);
			callback(err, null);
			return;
		}
		conn.execute("select u.id, u.name, u.kana, ud.birth, ud.club from user1 u, userdetail ud where u.id=ud.id and u.id=:id", [id], function(err, result){
//			conn.close();
			if(err){
				console.log(err.message);
				callback(err, null);
				return;
			}
			callback(null, result);
		});
	});
};

var userSearch = function(id, name, kana, callback){
	console.log("userSearch called...");
	oracledb.getConnection(dbConfig, function(err, conn){
		if(err){
			console.error(err.message);
			callback(err, null);
			return;
		}
		conn.execute("select u.id, u.name, u.kana, ud.birth, ud.club from user1 u, userdetail ud where u.id = ud.id and u.id like :id and u.name like :name and u.kana like :kana order by ud.no asc", [id, name, kana], function(err, result){
			console.log("execute ok!!");
//			conn.close();
			if(err){
				console.error(err.message);
				callback(err, null);
				return;
			}
			callback(null, result);
		});
	});
};

module.exports.login = login;
module.exports.idCheck = idCheck;
module.exports.userInsert = userInsert;
module.exports.userDelete = userDelete;
module.exports.userUpdate = userUpdate;
module.exports.userFind = userFind;
module.exports.userSearch = userSearch;