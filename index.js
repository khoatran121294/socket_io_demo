var express = require("express");
var socket = require("socket.io");

var app = express();
var http = require("http").Server(app);
var io = socket(http);

//define constants
var PORT = 3000;

//config express modules
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views")

app.get("/", function(req, res){
    res.render("home");
});

http.listen(PORT, function(e){
    console.log("- server is running at port " + PORT);
});

var counter = 0;
var userCounter = 0;
//listener event when new socket is connected
io.on("connection", function(socket){
    
    userCounter++;  // count current user is join in room
    socket.name = "USER " + (++counter);    // naming for socket

    io.sockets.emit("users_is_online", userCounter);
    console.log("[LOG] - new socket is connected, id = " + socket.id);

    //emit message all other socket expect itself
    socket.broadcast.emit("new_user_connect", socket.name);

    //emit message to itself
    socket.emit("current_user", socket.id);

    //listen event when this socket is disconnected
    socket.on("disconnect", function(){
        userCounter--;
        console.log("[LOG] - " + socket.id + " is disconnected.");
        io.sockets.emit("user_disconnect", socket.name);
        io.sockets.emit("users_is_online", userCounter);
    });

    //listent chat event from client send to
    socket.on("chat_event", function(_message){
        console.log("[LOG] - " + socket.id + " sent message : " + _message);

        //re-emit message to all socket client which joining in the pool
        io.sockets.emit("chat_event", {
            id : socket.id,
            name : socket.name,
            message : _message
        });
    });


});