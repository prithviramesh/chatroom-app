var express = require("express"),
	app = express(),
	server = require("http").createServer(app),
	bodyParser = require("body-parser"),
	_ = require("underscore"),
	io = require("socket.io").listen(server);



var participants = [];


app.set("ipaddr", "127.0.0.1");
app.set("port", 8080);

app.set("views", __dirname + "/views");
app.set('view engine', "jade");

app.use(express.static(__dirname+ '/public'));

app.use(bodyParser.json());

app.get('/', function(req, res){

	res.render("index");
});

app.post("/message", function(req, res){
	
	var message = req.body.message;

	if(_.isUndefined(message) || _.isEmpty(message.trim())){

		return res.status(400).json({error:"Message is invalid"});
	}

	var name = req.body.name;
	io.sockets.emit("incomingMessage", {message: message, name:name});

	res.status(200).json({message:"Message recieved"});

});


//socket.io event handlers
io.on("connection", function(socket){

	socket.on("newUser", function(data){
		participants.push({id:data.id, name:data.name});
		io.sockets.emit("newConnection", {participants:participants});
	});

	socket.on("nameChange", function(data){
		_.findWhere(participants, {id:socket.id}).name = data.name;
		io.sockets.emit("nameChanged", {id:data.id, name:data.name});
	});

	socket.on("disconnect", function(){

		participants = _.without(participants, _.findWhere(participants, {id:socket.id}));
		io.sockets.emit("userDisconnected", {id:socket.id, sender:'system'});

	});

});
	
server.listen(app.get("port"), app.get("ipaddr"), function(){

	console.log("server is up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});