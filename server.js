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
// Start the server and listen on the specified port
app.listen(HTTP_PORT, function() {
  console.log("Express http server listening on port " + HTTP_PORT);
});
// Route to get all published posts
app.get("/blog", function(req, res) {
  const publishedPosts = blogService.getPublishedPosts();
  res.json(publishedPosts);
});
// Route to get all posts
app.get("/posts", function(req, res) {
  const allPosts = blogService.getAllPosts();
  res.json(allPosts);
});
// Route to get all categories
app.get("/categories", function(req, res) {
  const allCategories = blogService.getAllCategories();
  res.json(allCategories);
});
// Route for unmatched routes
app.get("*", function(req, res) {
  res.status(404).send("Page Not Found");
});
