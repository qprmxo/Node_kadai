var express = require('express')
, http = require("http")
, path = require("path");

var bodyParser = require("body-parser")
, static = require("serve-static")
, mysql = require('mysql')
, multer = require("multer");

var pool = mysql.createPool({
	connectionLimit : 10,
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'kadaidb',
	debug : false
});

var app = express();

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use("/pppp", express.static(path.join(__dirname, 'pppp')));
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

var storage = multer.diskStorage({
	destination : function(req, file, callback){
		callback(null, 'uploads');
	},
	filename : function(req, file, callback){
		callback(null, file.originalname + Date.now());
	}
});

var upload = multer({
	storage : storage,
	limits : {
		files : 10,
		fileSize : 1024 * 1024 * 1024
	}
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

var router = express.Router();

router.route('/process/insert').post(upload.array('photo',1), function(req, res){
	console.log('/process/insert called...');
	
	var writer = req.body.writer;
	var regdate = req.body.regdate;
	var content = req.body.content;
	var file = req.files;
	
	var original = file[0].originalname;
	var filename = file[0].filename;
	
	if(pool){
		insert(writer, regdate, content, original, filename, function(err, result){
			if(err){
				console.log("insert error : " + err.stack);
				res.writeHead("200",{"Content-Type":"text/html;charset=utf8"});
				res.write("<h2>insert error!!</h2>");
				res.write("<p>" + err.stack + "</p>");
				res.end();
				return;
			}
			
			res.writeHead("200",{"Content-Type":"text/html;charset=utf8"});
			if(result){
				res.write("<h1>insert success!!</h1>");
			}else{
				res.write("<h1>insert fail!!</h1>");
			}
			res.write("<br><a href='/pppp/photo2.html'><button type='button'>Retry</button></a>");
			res.write("<a href='/process/list'><button type='button'>Message List</button></a>");
			res.end();
		});
	}else{
		res.writeHead("200",{"Content-Type":"text/html;charset=utf8"});
		res.write("<h2>database connect error!!</h2>");
		res.end();
	}
});

router.route('/process/list').get(function(req, res){
	console.log('/process/list called...');
	
	if(pool){
		list(function(err, result){
			if(err){
				console.error("List find error : " + err.stack);
				
				res.writeHead("200",{"Content-Type":"text/html;charset=utf8"});
				res.write("<h2>List find error!!</h2>");
				res.write("<p>" + err.stack + "</p>");
				res.end();
				return;
			}
			
			if(result){
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>Message List</h2>');
				res.write("<table border='1'><tr><th>Writer</th><th>Regdate</th><th>Content</th><th>FileName</th><th>File</th></tr>");
				
				for(var i = 0; i < result.length; i++){
					var writer = result[i].writer;
					var regdate = result[i].regdate;
					var content = result[i].content;
					var name = result[i].original;
					var filename = result[i].savefile;
					res.write("<tr><td>" + writer + "</td><td>" + regdate + "</td><td>" + content + "</td><td>" + name + "</td><td><img src='\\uploads\\" + filename + "'/></td></tr>");
				}
				
				res.write("</table>");
				res.write("<br><a href='/pppp/photo2.html'><button type='button'>Upload</button></a>");
			}
		});
	}else{
		res.writeHead("200",{"Content-Type":"text/html;charset=utf8"});
		res.write("<h2>database connect fail</h2>");
		res.end();
	}
});

app.use('/', router);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Server start!, port : " + app.get('port'));
});