const db = require("../models");

module.exports = function(app) {
  // Load index page
  app.get("/", function(req, res) {
    res.render("index");
  });

  app.get('/game', function(req, res){
    res.writeHead(302, {
      'Location': '/'+generateHash(6)
    });
    res.end();
  })

  app.get("/[A-Za-z0-9]{6}", (req, res) => {
    res.render("game");
  })


  
  const generateHash = (length) => {
    let hashPool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      output = '';
    for(let i = 0; i < length; i++) {
      output += hashPool.charAt(Math.floor(Math.random() * hashPool.length));
    }
    return output;
  };

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });
};
