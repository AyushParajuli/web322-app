
var express = require("express");
var app = express();
require("dotenv").config();
var path = require("path");
const blogService = require("./blog-service.js");
var HTTP_PORT = process.env.PORT || 8080;
// Serve static files from the "public" directory
app.use(express.static("public"));
// Redirect "/" route to "/about" route
app.get("/", function(req, res) {
  res.redirect("/about");
});
// Serve the about.html file from the views folder
app.get("/about", function(req, res) {
  res.sendFile(path.join(__dirname, "./views/about.html"));
});
// Initialize blog-service and start the server
blogService.initialize()
  .then(() => {
    // Route to get all published posts
    app.get("/blog", function(req, res) {
      blogService.getPublishedPosts()
        .then(publishedPosts => res.json(publishedPosts))
        .catch(error => res.status(500).send(error));
    });
    // Route to get all posts
    app.get("/posts", function(req, res) {
      blogService.getAllPosts()
        .then(allPosts => res.json(allPosts))
        .catch(error => res.status(500).send({message : error}));
    });
    // Route to get all categories
    app.get("/categories", function(req, res) {
      blogService.getCategories()
        .then(allCategories => res.json(allCategories))
        .catch(error => res.status(500).send({message : error}));
    });
    // Route for unmatched routes
    app.get("*", function(req, res) {
      res.status(404).send("Page Not Found");
    });
    // Start the server and listen on the specified port
    app.listen(HTTP_PORT, function() {
      console.log("Express http server listening on port " + HTTP_PORT);
    });
  })
  .catch(error => {
    console.error("Failed to initialize blog-service:", error);
  });
