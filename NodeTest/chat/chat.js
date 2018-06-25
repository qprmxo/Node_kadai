var chat = {
	users : [],
	rooms : [],
	addUser : function(nickname){
		this.users.push(nickname);
	},
	addRoom : function(roomname){
		var check = "true";
		for(var i=0; i < this.rooms.length; i++){
			if(this.rooms[i].roomname === roomname){
				check = "false";
			}
		}
		if(check === "true"){
			this.rooms.push({roomname:roomname, attendants:[]});
		}
	},
	joinRoom : function(roomname, nickname){
		var rooms = this.rooms.filter(function(element){
			return roomname === element.roomname;
		});
		if(rooms.length > 0){
			if(rooms[0].attendants.length < 1){
				rooms[0].attendants.push(nickname);
			}else{
				var check = "true";
				for(var i=0; i < rooms[0].attendants.length; i++){
					if(rooms[0].attendants[i] === nickname){
						check = "false";
					}
				}
				if(check === "true"){
					rooms[0].attendants.push(nickname);
				}
			}
		}
	},
	getAttendantsList : function(roomname){
		var room = this.rooms.filter(function(element){
			return roomname === element.roomname;
		});
		if(room.length > 0){
			return room[0].attendants;
		}
	},
	hasUser : function(nickname){
		var users = this.users.filter(function(element){
			return nickname === element;
		});
		if(users.length > 0){
			return true;
		}else{
			return false;
		}
	},
	removeAttendants : function(roomname, nickname){
		var rooms = this.rooms.filter(function(element){
			return (element.roomname === roomname);
		});
		var att = rooms[0].attendants.filter(function(element){
			return element !== nickname;
		});
		if(att.length < 1){
			var roomDel = rooms[0].roomname;
			var roomNew = [];
			for(var i=0; i < this.rooms.length; i++){
				if(this.rooms[i].roomname !== roomDel){
					roomNew.push(this.rooms[i]);
				}
			}
			this.rooms = roomNew;
		}else{
			rooms[0].attendants = att;
		}
	},
	getRoomList : function(){
		var roomnames = this.rooms.map(function(element){
			return element.roomname;
		});
		return roomnames;
	}
};

module.exports = chat;