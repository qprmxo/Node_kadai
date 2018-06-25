var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");

var routes = require("./routes/index");
var chatserver = require("./chat/chatserver");

var app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/chat");
app.set("view engine", "pug");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
	secret : "my key",
	resave : false,
	saveUninitialized: true
}));
app.use('/chat', express.static(path.join(__dirname, 'chat')));
app.use("/", routes);

var server = app.listen(app.get("port"), function(){
	console.log("Server Starting, port : " + server.address().port);
});

chatserver(server);

module.exports = app;