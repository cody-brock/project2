var db = require("../models");

module.exports = function(app) {
  // Get all examples
  app.get("/api/examples", function(req, res) {
    db.Example.findAll({}).then(function(dbExamples) {
      res.json(dbExamples);
    });
  });

  // Create a new example
  app.post("/api/examples", function(req, res) {
    db.Example.create(req.body).then(function(dbExample) {
      res.json(dbExample);
    });
  });

  // Delete an example by id
  app.delete("/api/examples/:id", function(req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function(dbExample) {
      res.json(dbExample);
    });
  });


  // POST route for saving a new end of game result
  app.post("/result", function(req, res) {
    // console.log("We are inside the result post api route!");
    // console.log("req.body", req.body);
    db.Result.create(req.body).then(function(dbPost) {
      res.json(dbPost);
    });
  });

  // GET route that updates the win/loss record on DOM
  app.get("/updateResults", function(req, res) {
    // console.log("We are inside the update results GET api route!");
    // console.log("req.body", req.body);
    db.Result.findAll({
      // where: winner
      // include: [db.Author]
    }).then(function(dbResult) {
      // res.json(dbPost);
      // console.log(dbResult);
      res.json(dbResult);
    });
  });

  app.post("/move", function(req, res) {
    // console.log("We are inside the move post api route!");
    // console.log("POST req.body", req.body);
    db.Move.create(req.body).then(function(dbPost) {
      // console.log("DBPOST: ", dbPost);
      res.json(dbPost);
    });
  });

  app.get("/updateMove", function(req, res) {
    // console.log("we are updating the move now yeahhhh");
    // console.log(req.body);
    db.Move.findAll({
    }).then(function(dbResult) {
      res.json(dbResult);
    })
  })
};
