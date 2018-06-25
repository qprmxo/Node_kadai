var express = require('express')
, http = require("http")
, path = require("path");

var message = require('./message');

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
app.set("views", __dirname + "/message");
app.set("view engine", "pug");
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
		message.insert(writer, regdate, content, original, filename, function(err, result){
			if(err){
				console.log("insert error : " + err.stack);
				res.writeHead("200",{"Content-Type":"text/html;charset=utf8"});
				res.write("<h2>insert error!!</h2>");
				res.write("<p>" + err.stack + "</p>");
				res.end();
				return;
			}
			
			res.writeHead("200",{"Content-Type":"text/html;charset=utf8"});
			var context;
			if(result){
				context = {result:"insert success!!"};
			}else{
				context = {result:"insert fail!!"};
			}
			req.app.render("result", context, function(err, html){
				if(err){throw err;}
				res.end(html);
			});
		});
	}else{
		res.writeHead("200",{"Content-Type":"text/html;charset=utf8"});
		res.write("<h2>database connect error!!</h2>");
		res.end();
	}
});

router.route("/process/delete").get(function(req, res){
	console.log("/process/delete called...");
	
	var filename = req.query.filename;
	
	if(pool){
		message.msgDelete(filename, function(err, result) {
			if(err){
				console.error("msgDelete error : " + err.stack);
				
				res.writeHead("200", {"Content-Type":"text/html;charset=utf8"});
				res.write("<p>" + err.stack + "</p>");
				res.end();
				return;
			}
			
			res.writeHead("200", {"Content-Type":"text/html;charset=utf8"});
			var context;
			
			if(result){
				context = {result:"msgDelete success!!"};
			}else{
				context = {result:"msgDelete fail!!"};
			}
			req.app.render("result", context, function(err, html){
				if(err){throw err;}
				res.end(html);
			});
		});
	}
});

router.route('/process/list').get(function(req, res){
	console.log('/process/list called...');
	
	if(pool){
		message.list(function(err, result){
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
				
				var context = {result:result};
				
				req.app.render("list", context, function(err, html){
					if(err){throw err;}
					res.end(html);
				});
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