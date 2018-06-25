var express = require('express')
, http = require('http')
, path = require('path');

var bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static');

var expressSession = require('express-session');

var multer = require('multer');
var fs = require('fs');

//var cors = require('cors');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.use('/pppp', express.static(path.join(__dirname, 'pppp')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cookieParser());

app.use(expressSession({
	secret : 'my key',
	resave : true,
	saveUninitialized : true
}));

//app.use(cors());

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
	console.log('/process/photo called');
	
	try{
		var files = req.files;
		
		console.dir('#=== Uploaded first file info ===#');
		console.dir(req.files[0]);
		console.dir('#===#');
		
		var originalname = '', filename = '', mimetype = '', size = 0;
		
		if(Array.isArray(files)){
			console.log('in array files : %d', files.length);
			
			for(var index = 0; index < files.length; index++){
				originalname = files[index].originalname;
				filename = files[index].filename;
				mimetype = files[index].mimetype;
				size = files[index].size;
			}
		}else{
			console.log('file : 1');
			
			originalname = files[0].originalname;
			filename = files[0].filename;
			mimetype = files[0].mimetype;
			size = files[0].size;
		}
		
		console.log('Now file info : ' + originalname + ', ' + filename + ', ' + mimetype + ', ' + size);
		
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h3>File Upload success</h3>');
		res.write('<hr/>');
		res.write('<p>original name : ' + originalname + ' -> save name : ' + filename + '</p>');
		res.write('<p>mime type : ' + mimetype + '</p>');
		res.write('<p>file size : ' + size + '</p>');
		res.end();
		
	}catch(err){
		console.dir(err.stack);
	}
});

app.use('/', router);

http.createServer(app).listen(3000, function(){
	console.log('Start8_fileUpload : 3000');
});