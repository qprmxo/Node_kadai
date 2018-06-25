var express = require('express')
, http = require('http')
, path = require('path');

var user = require("./user");

var bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static');
var expressSession = require('express-session');
var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit : 10,
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'kadaidb',
	debug : false
});

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/pppp', express.static(path.join(__dirname, 'pppp')));
app.use(cookieParser());

app.use(expressSession({
	secret : 'my key',
	resave : true,
	saveUninitialized: true
}));

var router = express.Router();

router.route('/process/login').post(function(req, res){
	console.log('/process/login called...');
	
	var id = req.body.id || req.query.id;
	var password = req.body.password || req.query.password;
	
	console.log('param : ' + id + ', ' + password);
	
	if(pool){
		user.authUser(id, password, function(err, rows){
			if(err){
				console.log('User login error : ' + err.stack);
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>User login error occar!!</h2>');
				res.write('<p>' + err.stack + '</p>');
				res.end();
				
				return;
			}
			
			if(rows){
				console.dir(rows);
				
				var name = rows[0].name;
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>Login success</h1>');
				res.write('<div><p>User id : ' + id + '</p></div>');
				res.write('<div><p>User name :' + name + '</p></div>');
				res.write("<br><br><a href='/pppp/login2.html'>Retry</a>");
				res.write("<br><br><a href='/pppp/listuser.html'>User List</a>");
				res.end();
			}
		});
	}
});

router.route('/process/adduser').post(function(req, res){
	console.log('/process/adduser called...');
	
	var id = req.body.id || req.query.id;
	var pwd = req.body.password || req.query.password;
	var name = req.body.name || req.query.name;
	var age = req.body.age || req.query.age;
	
	console.log('req param : ' + id + ', ' + pwd + ', ' + name + ', ' + age);
	
	if(pool){
		user.addUser(id, name, age, pwd, function(err, addedUser){
			if(err){
				console.error('user inserting error : ' + err.stack);
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>user inserting error</h2>');
				res.write('<p>' + err.stack + '</p>');
				res.end();
				
				return;
			}
			
			if(addedUser){
				console.dir(addedUser);
				console.log('inserted ' + addedUser.affectedRows + ' rows');
				
				var insertId = addedUser.insertId;
				console.log('inserting record id : ' + insertId);
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>user insert success<	/h2>');
				res.write("<br><br><a href='/pppp/listuser.html'>User List</a>");
				res.end();
			}else{
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>user insert fail</h2>');
				res.end();
			}
		});
	}else{
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>database connect fail</h2>');
		res.end();
	}
});

router.route('/process/delete').get(function(req, res){
	console.log('/process/delete called...');
	
	var id = req.body.id || req.query.id;
	
	if(pool){
		user.deleteUser(id, function(err, result){
			if(err){
				console.error('user delete error : ' + err.stack);
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>user delete error!!</h2>');
				res.write('<p>' + err.stack + '</p>');
				res.end();
				
				return;
			}
			
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			
			if(result){
				console.dir(result);
				res.write('<h2>user delete success!!</h2>');
			}else{
				res.write('<h2>user delete fail!</h2>');
			}
			res.write("<br><br><a href='/pppp/listuser.html'>User List</a>");
			res.end();
		});
	}else{
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>database connect fail</h2>');
		res.end();
	}
});

router.route('/process/findUser').get(function(req, res){
	console.log('/process/findUser called...');
	
	var id = req.body.id || req.query.id;
	
	if(pool){
		user.findUser(id, function(err, result){
			if(err){
				console.error('user find error : ' + err.stack);
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>user find error!!</h2>');
				res.write('<p>' + err.stack + '</p>');
				res.end();				
				return;
			}
			
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			res.write('<h2>User update form</h2>');
			res.write("<form action='/process/update' method='post'>");
			res.write("<table><tr><th>ID</th><td><input type='text' name='id' readonly='readonly' value='" + result[0].id + "'></td></tr>");
			res.write("<tr><th>Name</th><td><input type='text' name='name' value='" + result[0].name + "'></td></tr>");
			res.write("<tr><th>Age</th><td><input type='text' name='age' value='" + result[0].age + "'></td></tr>");
			res.write("<tr><th>Password</th><td><input type='text' name='password' value='" + result[0].password + "'></td></tr></table>");
			res.write("<br><button type='submit'>Update</button></form>");
			res.end();
		});
	}else{
		res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>database connect fail!!</h2>');
		res.end();
	}
});

router.route('/process/update').post(function(req, res){
	console.log('/process/update called...');
	
	var id = req.body.id || req.query.id;
	var name = req.body.name || req.query.name;
	var age = req.body.age || req.query.age;
	var password = req.body.password || req.query.password;
	
	if(pool){
		user.updateUser(id, name, age, password, function(err, result){
			if(err){
				console.error('user update error : ' + err.stack);
				res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>User update error!!</h2>');
				res.write("<p>" + err.stack + "</p>");
				res.end();
			}
			
			res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
			if(result){
				res.write('<h2>User update success!!</h2>');
			}else{
				res.write('<h2>User update fail!!</h2>');
			}
			res.write("<br><br><a href='/pppp/listuser.html'>User List</a>");
			res.end();
		});
	}else{
		res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>database connect fail!!</h2>');
		res.end();
	}
});

router.route('/process/listuser').post(function(req, res){
	console.log('/process/listuser called...');
	
	if(pool){
		user.findAll(function(err, result){
			if(err){
				console.error('user find error : ' + err.stack);
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>user find error!!!!</h2>');
				res.write('<p>' + err.stack + '</p>');
				res.end();
				
				return;
			}
			
			if(result){
				console.dir(result);
				
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>User List</h2>');
				res.write('<div><ul>');
				
				for(var i = 0; i < result.length; i++){
					var id = result[i].id;
					var name = result[i].name;
					var age = result[i].age;
					res.write("<li>#" + i + " : " + id + ", " + name + ", " + age + "	<a href='/process/delete?id=" + id + "'><button type='button'>Delete</button></a>	<a href='/process/findUser?id=" + id + "'><button type='button'>Update</button></a></li>");
				}
				
				res.write('</ul></div>');
				res.write("<br><br><a href='/pppp/adduser2.html'>addUser</a>");
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
	console.log('Server start, port : ' + app.get('port'));
});