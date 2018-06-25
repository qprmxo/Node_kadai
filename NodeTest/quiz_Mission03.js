var express = require('express')
, http = require('http')
, path = require('path');

var bodyParser = require('body-parser')
, static = require('serve-static');

var multer = require('multer');

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.use('/pppp', express.static(path.join(__dirname, 'pppp')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

router.route('/process/photo').post(upload.array('photo',1), function(req, res){
	console.log('/process/photo called!!');
	
	var writer = req.body.id;
	var regdate = req.body.regdate;
	var content = req.body.content;
	var file = req.files;
	
	var originalname = file[0].originalname;
	var filename = file[0].filename;
	var mimetype = file[0].mimetype;
	var size = file[0].size;
	
	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	res.write('<h3>Message is saved...</h3>');
	res.write('<p>writer : ' + writer + '</p>');
	res.write('<p>regdate : ' + regdate + '</p>');
	res.write('<p>content : ' + content + '</p>');
	res.write("<img src='\\" + file[0].path + "'/>");
	
	console.log(file[0].path);
	
	res.write("<button type='button'><a href='/pppp/photo.html'>Rewrite</a></button>");
	res.end();
});

app.use('/', router);

http.createServer(app).listen(3000, function(){
	console.log('Server Start!!!');
});