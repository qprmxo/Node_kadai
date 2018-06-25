var http = require("http");
var fs = require("fs");
var socketio = require("socket.io");
var server = http.createServer(function(req, res){
	fs.readFile("./chat.html", function(err, data){
		if(err){
			console.log("error : " + err);
		}else{
			res.writeHead(200, {"Content-Type":"text/html"});
			res.write(data);
			res.end();
		}
	});
});

server.listen(3000, function(){
	console.log("Server Start");
});

var io = socketio.listen(server);
io.sockets.on("connection", function(socket){
	console.log("client connection");
	
	socket.on("sendMsg", function(data){
		console.log("event occar!!" + data.nickname + ", " + data.msg);
		
		io.sockets.emit("recMsg", data);
//		socket.broadcast.emit("recMsg", data);
	});
	socket.on("exit", function(data){
		io.sockets.emit("recExit", data);
//		socket.broadcast.emit("recExit", data);
		
		socket.disconnect();
	});
});