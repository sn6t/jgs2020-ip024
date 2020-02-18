var app = require("express")();
var basicAuth = require("basic-auth-connect");
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;

app.use(basicAuth("jgs", "jgs"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  socket.on("chat message", function(msg) {
    io.emit("chat message", msg);
  });

  socket.on("thumbs up", function(message_id) {
    io.emit("thumbs up", message_id);
  });

  socket.on("thinking face", function(message_id) {
    io.emit("thinking face", message_id);
  });
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
