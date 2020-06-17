var app = require("express")();
var basicAuth = require("basic-auth-connect");
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
var xss = require("xss");
require("dotenv").config();

app.use(basicAuth(process.env.USERNAME, process.env.PASSWORD));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  socket.on("chat message", function (data) {
    io.emit("chat message", {
      from: data.from,
      msg: xss(data.msg),
      nowid: data.nowid,
    });
  });

  socket.on("thumbs up", function (id) {
    io.emit("thumbs up", xss(id));
  });

  socket.on("question", function (id) {
    io.emit("question", xss(id));
  });
});

http.listen(port, function () {
  console.log("listening on *:" + port);
});
