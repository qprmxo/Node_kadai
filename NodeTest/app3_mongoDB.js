var express = require('express')
, http = require('http')
, path = require('path');

var bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static');

var expressSession = require('express-session');
var app = express();

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use('/pppp', express.static(path.join(__dirname, 'pppp')));
app.use(cookieParser());

app.use(expressSession({
	secret : 'my key',
	resave : true,
	saveUninitialized: true
}));

var MongoClient = require('mongodb').MongoClient;
var database;
function connectDB(){
	var databaseUrl = 'mongodb://localhost:27017/local';
	MongoClient.connect(databaseUrl, function(err, db){
		if(err) {throw err;}
		console.log('database connect ok : ' + databaseUrl);
		database = db;
	});
}

var authUser = function(database, id, password, callback){
	console.log('authUser called...');
	var users = database.collection('users');
	users.find({"id":id,"password":password}).toArray(function(err, docs){
		if(err){
			callback(err, null);
			return;
		}
		if(docs.length>0){
			console.log('id [%s], password [%s] is correct.', id, password);
			callback(null, docs);
		}else{
			console.log("incorrect!!");
			callback(null, null);
		}
	});
};

var addUser = function(database, id, password, name, callback){
	console.log('addUser called : ' + id + ', ' + password + ', ' + name);
	
	var users = database.collection('users');
	
	users.insertMany([{"id":id, "password":password, "name":name}], function(err, result){
		if(err){
			callback(err, null);
			return;
		}
		
		if(result.insertedCount>0){
			console.log("user added : " + result.insertedCount);
		}else{
			console.log("notting");
		}
		callback(null, result);
	});
};

app.post('/process/login', function(req, res){
	console.log('/process/login called!!');
	
	var id = req.param('id');
	var password = req.param('password');
	
	if(database){
		authUser(database, id, password, function(err, docs){
			if(err) {throw err;}
			
			if(docs){
				console.dir(docs);
				var name = docs[0].name;
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>Login success</h1>');
				res.write('<div><p>id : ' + id + '</p></div>');
				res.write('<div><p>name : ' + name + '</p></div>');
				res.write("<br><br><a href='/pppp/login.html'>Retry</a>");
				res.end();
			}
		});
	}else{
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>database connect fail...</h2>');
		res.write('<div><p>database inconnect</p></div>');
		res.end();
	}
});

var router = express.Router();

router.route("/process/login").post(function(req, res){
	console.log('/process/login called!');
	
});

router.route("/process/adduser").post(function(req, res){
	console.log('process/adduser called...');
	
	var id = req.body.id || req.query.id;
	var password = req.body.password || req.query.password;
	var name = req.body.name || req.query.name;
	
	console.log('params : ' + id + ', ' + password + ', ' + name);
	
	if(database){
		addUser(database, id, password, name, function(err, result){
			if(err) {throw err;}
			
			if(result && result.insertedCount > 0){
				console.dir(result);
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>insert success</h2>');
				res.end();
			}else{
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>insert fail</h2>');
				res.end();
			}
		});
	}else{
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>database inconnect</h2>');
		res.end();
	}
});

app.use('/', router);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Server Starting! port = ' + app.get('port'));
	
	connectDB();
});