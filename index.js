var app = require("express")();
var basicAuth = require("basic-auth-connect");
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
var xss = require("xss");
require("dotenv").config();

app.use(basicAuth(process.env.USERNAME, process.env.PASSWORD));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  socket.on("chat message", function(msg) {
    io.emit("chat message", xss(msg));
  });

  socket.on("thumbs up", function(msg) {
    io.emit("thumbs up", xss(msg));
  });

  socket.on("question", function(msg) {
    io.emit("question", xss(msg));
  });
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
