var express = require("express");
var app = express();
require("dotenv").config();
var path = require("path");

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
