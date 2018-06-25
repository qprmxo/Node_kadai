var express = require("express")
, http = require("http")
, path = require("path");

var bodyParser = require("body-parser")
, static = require("serve-static")
, cookieParser = require("cookie-parser")
, session = require("express-session")
, oracledb = require("oracledb")
, dbConfig = require("./dbconfig.js")
, kadai = require("./kadai.js");

var app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/user");
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "util")));
app.use(cookieParser());
app.use(session({
	secret : "my key",
	resave : true,
	saveUninitialized: true
}));

var router = express.Router();

router.route("/").get(function(req, res){
	console.log("/ path called...");
	res.render("login.pug");
});

app.post("/login", function(req, res){
	console.log("/login called...");
	var id = req.body.id || req.query.id;
	var pwd = req.body.pwd || req.query.pwd;
	
	kadai.login(id, pwd, function(err, result){
		if(err){
			console.error(err.stack);
			return;
		}
		if(result){
			if(result === "true"){
				req.session.user = {id:id};
				res.render("search.pug");
			}else if(result === "false"){
				res.render("login.pug", {result:"パスワードが間違ってます。"});       
			}else{
				res.render("login.pug", {result:result});
			}
		}
	});
});

app.get("/logout", function(req, res){
	console.log("/logout called...");
	req.session.destroy(function(err){
		if(err) {throw err;}
	});
	res.render("login.pug");
});

app.get("/join", function(req, res){
	console.log("/join called...");
	res.render("join.pug");
});

app.post("/join", function(req, res){
	console.log("/join called...");
	
	var id = req.body.id;
	var pass = req.body.pass;
	var name = req.body.name;
	var kana = req.body.kana;
	var birth = req.body.birth;
	var club = req.body.club;
	
	kadai.userInsert(id, pass, name, kana, birth, club, function(err, result){
		if(err){
			console.error(err.message);
			res.render("result.pug", {msg:"失敗"});
		}
		if(result){
			req.session.user = {id:id};
			res.render("result.pug",{msg:"完了"});
		}else{
			res.render("result.pug", {msg:"失敗"});
		}
	});
});

app.post("/joinCheck", function(req, res){
	console.log("/joinCheck called...");
	
	var id = req.body.id;
	var pass = req.body.pass;
	var name = req.body.name;
	var kana = req.body.kana;
	var birth = req.body.birth;
	var club = req.body.club;
	
	res.render("joinCheck.pug",{id:id, pass:pass, name:name, kana:kana, birth:birth, club:club});
});

app.post("/idCheck", function(req, res){
	console.log("/idCheck called...");
	
	var id = req.body.id;
	var name = req.body.name;
	var kana = req.body.kana;
	var birth = req.body.birth;
	var club = req.body.club;
	var msg;
	
	kadai.idCheck(id, function(err, result){
		if(err){
			console.error(err.message);
			return;
		}
		if(result){
			if(result === "true"){	
				msg = "使用可能なIDです。";
			}else{
				msg = "同じIDが存在します。";
			}
			console.log(msg);
			res.render("join.pug",{id:id, name:name, kana:kana, birth:birth, club:club, result:msg});
		}
	});
});

app.get("/delete", function(req, res){
	console.log("/delete called...");
	var id = req.query.id;
	
	kadai.userFind(id, function(err, result){
		if(err){
			console.error(err.message);
			return;
		}
		if(result.rows.length > 0){
			res.render("delete.pug", {result:result});
		}else{
			res.render("result.pug", {msg:"失敗"});
		}
	});
});

app.post("/delete", function(req, res){
	console.log("/delete called...");
	
	var id = req.body.id;

	kadai.userDelete(id, function(err, result){
		if(err){
			console.error(err.message);
			return;
		}
		if(result){
			res.render("result.pug",{msg:"完了"});
		}else{
			res.render("result.pug",{msg:"失敗"});
		}
	});
});

app.get("/update", function(req, res){
	console.log("/update called...");
	var id = req.query.id;
	
	kadai.userFind(id, function(err, result){
		if(err){
			console.error(err.message);
			return;
		}
		if(result.rows.length > 0){
			res.render("update.pug", {result:result});
		}else{
			res.result("result.pug", {msg:"失敗"});
		}
	});
});
app.post("/update", function(req, res){
	console.log("/update called...");
	var id = req.body.id;
	var name = req.body.name;
	var kana = req.body.kana;
	var birth = req.body.birth;
	var club = req.body.club;
	
	kadai.userUpdate(id, name, kana, birth, club, function(err, result){
		if(err){
			console.error(err.message);
		}
		if(result){
			res.render("result.pug", {msg : "完了"});
		}else{
			res.render("result.pug", {msg : "失敗"});
		}
	});
});
app.post("/updateCheck", function(req, res){
	console.log("/updateCheck called...");
	
	var id = req.body.id;
	var name = req.body.name;
	var kana = req.body.kana;
	var birth = req.body.birth;
	var club = req.body.club;
	
	res.render("updateCheck.pug", {id:id, name:name, kana:kana, birth:birth, club:club});
});

app.get("/search", function(req, res){
	console.log("/search called...");
	if(!req.session.user){
		console.log("You need to login...");
		res.render("login.pug");
	}
	res.render("search.pug");
});

app.post("/search", function(req, res){
	console.log("/search called...");
	if(!req.session.user){
		console.log("You need to login...");
		res.render("login.pug");
	}
	
	var id = req.body.id + "%";
	var name = req.body.name + "%";
	var kana = req.body.kana + "%";
	
	kadai.userSearch(id, name, kana, function(err, result){
		if(err){
			console.error(err.message);
			return;
		}
		console.dir(result);
		if(result.rows.length > 0){
			res.render("searchList.pug",{result:result, id:req.body.id, name:req.body.name, kana:req.body.kana});
		}else{
			res.render("search.pug",{result:result, id:req.body.id, name:req.body.name, kana:req.body.kana});
		}
	});
});

app.use("/", router);

http.createServer(app).listen(app.get("port"), function(){
	console.log("Server start, PORT : " + app.get("port"));
});