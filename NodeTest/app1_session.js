var express = require('express')
, http = require('http')
, path = require('path');

var bodyParser = require('body-parser')
, static = require('serve-static');

var app = express();
var router = express.Router();
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

router.route('/process/login/:name').post(function(req, res){
	console.log('process login ok');
	
	var id = req.body.id || req.query.id;
	var pwd = req.body.password || req.query.password;
	var name = req.params.name;
	
	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	res.write('<h1>Express</h1>');
	res.write('<div><p>name : ' + name + '</p></div>');
	res.write('<div><p>id : ' + id + '</p></div>');
	res.write('<div><p>pwd : ' + pwd + '</p></div>');
	res.write("<br><br><a href='/login3.html'>login</a>");
	res.end();
});

router.route('/process/showCookie').get(function(req, res){
	console.log('/process/showCookie called');
	
	res.send(req.cookies);
});

router.route('/process/setUserCookie').get(function(req, res){
	console.log('/process/setUserCookie called');
	
	res.cookie('user',{id:'mike',name:'asdasd',authorized:true});
	
	res.redirect('/process/showCookie');
});

app.use(cookieParser());
app.use(expressSession({
	secret : 'my key',
	resave : true,
	saveUninitialized : true
}));

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'pppp')));

app.use('/', router);

http.createServer(app).listen(3000, function(){
	console.log('Start5 : 3000');
});