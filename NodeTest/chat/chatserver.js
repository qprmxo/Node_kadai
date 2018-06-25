var socketio = require("socket.io");
var chat = require("./chat");
var chatserver = function(app){
	var io = socketio.listen(app);
	io.sockets.on("connection", function(socket){
		console.log("Client connect!!");
		var joinRoom = null;
		socket.on("join", function(data){
			joinRoom = data.roomname;
			socket.join(joinRoom);
			socket.broadcast.to(joinRoom).emit("joined", {nickname:data.nickname});
		});
		socket.on("sendMsg", function(data){
			console.log(data.nickname + ", " + data.msg);
			io.to(joinRoom).emit("recMsg", data);
		});
		socket.on("leaveRoom", function(data){
			io.to(joinRoom).emit("leaveRoom", data);
			chat.removeAttendants(data.roomname, data.nickname);
			socket.leave(joinRoom);
			socket.disconnect();
		});
	});
};

module.exports = chatserver;