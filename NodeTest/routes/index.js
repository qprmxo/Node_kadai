var express = require("express");
var chat = require("../chat/chat");
var router = express.Router();

router.get("/", function(req, res){
	res.render("index");
});

router.post("/enter", function(req, res){
	var nickname = req.body.nickname || req.query.nickname;
	req.session.nickname = nickname;
	var roomlist = chat.getRoomList();
	chat.addUser(nickname);
	res.render("enter", {nickname:nickname, roomlist:roomlist});
});
router.get("/enter", function(req, res){
	var nickname = req.session.nickname;
	if(nickname === undefined){
		nickname = req.body.nickname || req.query.nickname;
		req.session.nickname = nickname;
		chat.addUser(nickname);
	}
	var roomlist = chat.getRoomList();
	res.render("enter", {nickname:nickname, roomlist:roomlist});
});

router.post("/makeroom", function(req, res){
	var roomname = req.body.roomname;
	var nickname = req.session.nickname;
	chat.addRoom(roomname);
	chat.joinRoom(roomname, nickname);
	var attendants = chat.getAttendantsList(roomname);
	res.render("join", {nickname:nickname, roomname:roomname, attendants:attendants});
});

router.get("/join/:roomname", function(req, res){
	var roomname = req.params.roomname;
	var nickname = req.session.nickname;
	chat.joinRoom(roomname, nickname);
	var attendants = chat.getAttendantsList(roomname);
	if(attendants){
		res.render("join", {nickname:nickname, roomname:roomname, attendants:attendants});
	}else{
		res.redirect("/enter");
	}
});

module.exports = router;