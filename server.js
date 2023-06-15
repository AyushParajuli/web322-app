/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Ayush Parajuli Student ID: 165601212 Date: june 15
*
* Cyclic Web App URL: https://odd-ruby-bullfrog-belt.cyclic.app/
*
* GitHub Repository URL: https://github.com/AyushParajuli/web322-app
*
********************************************************************************/


var express = require("express");
var app = express();
require("dotenv").config();
var path = require("path");

const blogService = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require('cloudinary');
const streamifier = require('streamifier');

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

//Server the addposts.html file from the views folder.
app.get("/posts/add", function(req, res){
  res.sendFile(path.join(__dirname, "./views/addPost.html"));
});


// upload variable without the disk storage
const upload = multer();

// Set the cloudinary config 
cloudinary.config({
  cloud_name : 'dvejlsqre',
  api_key : '179383226592744',
  api_secret : 'tevSCedsCurSw4BtMZFNaxiMK58',
  secure: true
});


// Add the route for adding a new post
app.post("/posts/add", upload.single("featureImage"), function(req, res) {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req)
      .then((uploaded) => {
        processPost(uploaded.url);
        res.redirect("/posts");
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        res.status(500).send("Success");
      });
  } else {
    processPost("");
    res.redirect("/posts");
  }

  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;
    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
  }
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
    
    
    // Route to get all posts with optional filters
      app.get("/posts", function(req, res) {
      const category = req.query.category; // Get the value of the "category" query parameter
      const minDate = req.query.minDate; // Get the value of the "minDate" query parameter

      if (category) {
        // If "category" query parameter is present, filter by category
        blogService.getPostsByCategory(category)
          .then(filteredPosts => res.json(filteredPosts))
          .catch(error => res.status(500).send({ message: error }));
      } else if (minDate) {
        // If "minDate" query parameter is present, filter by minimum date
        blogService.getPostsByMinDate(minDate)
          .then(filteredPosts => res.json(filteredPosts))
          .catch(error => res.status(500).send({ message: error }));
      } else {
        // If no filters are present, return all posts
        blogService.getAllPosts()
          .then(allPosts => res.json(allPosts))
          .catch(error => res.status(500).send({ message: error }));
      }
    });

    // Route to get a single post by ID
    app.get("/post/:id", function(req, res) {
      const postId = parseInt(req.params.id); // Get the value of the "id" parameter as an integer

      blogService.getPostById(postId)
        .then(post => res.json(post))
        .catch(error => res.status(500).send({ message: error }));
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

