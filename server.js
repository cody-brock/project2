/* eslint-disable linebreak-style */
require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");
var logic = require("./logic.js");
var app = express();
var PORT = process.env.PORT || 3000;
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);


var db = require("./models");

// Middleware
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(express.static("public"));

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Routes
require("./routes/apiRoutes")(app);
app.use(express.static("public"));
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));

const generateHash = (length) => {
  let hashPool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    room = '';
  for (let i = 0; i < length; i++) {
    room += hashPool.charAt(Math.floor(Math.random() * hashPool.length));
  }
  return room;
};

app.get("/", function (req, res) {
  res.render("index");
});

app.get('/game', function (req, res) {
  res.writeHead(302, {
    'Location': '/' + generateHash(6)
  });
  res.end();
})

app.get("/[A-Za-z0-9]{6}", (req, res) => {
  res.render("game");
})



// Render 404 page for any unmatched routes
app.get("*", function (req, res) {
  res.render("404");
});

// Sockets
io.sockets.on("connection", (socket) => {
  socket.on("join", (data) => {
    if (data.room in logic.games) {
      var game = logic.games[data.room];
      console.log(game);
      if (typeof game.p2 != "undefined") {
        return;
      }
      console.log('player 2 logged on');
      socket.join(data.room);
      socket.room = data.room;
      socket.pid = 2;
      socket.hash = generateHash(8);
      game.player2 = socket;
      socket.opponent = game.player1;
      game.player1.opponent = socket;
      socket.emit('assign', {
        pid: socket.pid,
        hash: socket.hash
      });
      game.turn = 1;
      socket.broadcast.to(data.room).emit('start');
    } else {
      console.log('player 1 is here');
      socket.room = data.room;
      // console.log(game.room);
      socket.pid = 1;
      socket.hash = generateHash(8);
      logic.games[data.room] = {
        player1: socket,
        moves: 0,
        board: [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0]
        ]
      };
      socket.emit('assign', {
        pid: socket.pid,
        hash: socket.hash
      });
    }
    socket.on('makeMove', function (data) {
      var game = logic.games[socket.room];
      if (data.hash = socket.hash && game.turn == socket.pid) {
        var move_made = logic.make_move(socket.room, data.col, socket.pid);
        if (move_made) {
          game.moves = parseInt(game.moves) + 1;
          socket.broadcast.to(socket.room).emit('move_made', {
            pid: socket.pid,
            col: data.col
          });
          game.turn = socket.opponent.pid;
          var winner = logic.check_for_win(game.board);
          if (winner) {
            io.to(socket.room).emit('winner', {
              winner: winner
            });
          }
          if (game.moves >= 42) {
            io.to(socket.room).emit('draw');
          }
        }
      }
    });

    socket.on('my_move', function (data) {
      socket.broadcast.to(socket.room).emit('opponent_move', {
        col: data.col
      });
    })

    socket.on('disconnect', function () {
      if (socket.room in logic.games) {
        delete logic.games[socket.room];
        io.to(socket.room).emit('stop');
        console.log('room closed: ' + socket.room);
      } else {
        console.log('disconnect called but nothing happend');
      }
    });
  });
});

var syncOptions = {
  force: false
};

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function () {
  server.listen(PORT, function () {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;