const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const xss = require('xss');

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('chat message', (data) => {
    io.emit('chat message', {
      from: data.from,
      msg: xss(data.msg),
      nowid: data.nowid,
    });
  });

  socket.on('thumbs up', (thumbsupid) => {
    io.emit('thumbs up', xss(thumbsupid));
  });

  socket.on('question', (questionid) => {
    io.emit('question', xss(questionid));
  });
});

http.listen(port, () => {
  console.log('listening on *:' + port);
});
