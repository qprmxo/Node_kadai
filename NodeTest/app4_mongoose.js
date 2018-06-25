var express = require('express')
, http = require('http')
, path = require('path');

var bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static');

var mongoose = require('mongoose');

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
var UserSchema;
var UserModel;
function connectDB(){
	var databaseUrl = 'mongodb://localhost:27017/local';
	console.log('Try database connect');
	
	mongoose.Promise = global.Promise;
	mongoose.connect(databaseUrl);
	database = mongoose.connection;
	
	database.on('error', console.error.bind(console, 'mongoose connection error.'));
	database.on('open', function(){
		console.log('database connect : ' + databaseUrl);
		
		UserSchema = mongoose.Schema({
			id : {type:String, required:true, unique:true},
			password : {type:String, required: true},
			name : {type:String, index : 'hashed'},
			age : {type:Number, 'default':-1},
			created_at : {type:Date, index:{unique:false}, 'default':Date.now},
			updated_at : {type:Date, index:{unique:false}, 'default':Date.now}
		});
		UserSchema.static('findById', function(id, callback){
			return this.find({id:id}, callback);
		});
		UserSchema.static('findAll', function(callback){
			return this.find({ }, callback);
		});
		console.log('UserSchema define');
		
		UserModel = mongoose.model("users2", UserSchema);
		console.log('UserModel define');
	});
	
	database.on('disconnected', function(){
		console.log('Disconnection! after 5 sec, Retry...');
		setInterval(connectDB, 5000);
	});
}

var authUser = function(database, id, password, callback){
	console.log('authUser called... : ' + id + ', ' + password);
	
	UserModel.findById(id, function(err, results){
		if(err){
			callback(err, null);
			return;
		}
		
		console.log('ID [%s] result...', id);
		console.dir(results);
		
		if(results.length > 0){
			console.log('User search success');
			
			if(results[0]._doc.password === password){
				console.log('password Ok.');
				callback(null, results);
			}else{
				console.log('password incorrect!');
				callback(null, null);
			}
		}else{
			console.log('ID incorrect!');
			callback(null, null);
		}
	});
};

var addUser = function(database, id, password, name, callback){
	console.log('addUser called : ' + id + ', ' + password + ', ' + name);
	
	var user = new UserModel({"id":id, "password":password, "name":name});
	
	user.save(function(err){
		if(err){
			callback(err, null);
			return;
		}
		
		console.log("data inserted");
		callback(null, user);
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
				res.write("<br><br><a href='/pppp/listuser.html'>UserList</a>");
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
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			res.write('<h2>insert success</h2>');
			res.write("<br><br><a href='/pppp/listuser.html'>UserList</a>");
			res.end();
		});
	}else{
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>database inconnect</h2>');
		res.end();
	}
});

router.route('/process/listuser').post(function(req, res){
	console.log('/process/listuser called...');
	
	if(database){
		UserModel.findAll(function(err, results){
			if(err){
				console.error('error!! : ' + err.stack);
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>Error occar!!</h2>');
				res.write('<p>' + err.stack + '</p>');
				res.end();
				
				return;
			}
			
			if(results){
				console.dir(results);
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>User List</h2>');
				res.write('<div><ul>');
				
				for(var i = 0; i < results.length; i++){
					var curId = results[i]._doc.id;
					var curName = results[i]._doc.name;
					res.write('<li>#' + i + ' : ' + curId + ', ' + curName + '</li>');
				}
				
				res.write('</ul></div>');
				res.write("<br><br><a href='/pppp/adduser.html'>addUser</a>");
				res.end();
			}else{
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>User List search fail</h2>');
				res.end();
			}
		});
	}else{
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>database connect fail</h2>');
		res.end();
	}
});

app.use('/', router);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Server Starting! port = ' + app.get('port'));
	
	connectDB();
});