var express = require('express');
var app = express();
require('dotenv').config();
var path = require('path');
const blogService = require('./blog-service.js');
const multer = require('multer');
const cloudinary = require('cloudinary');
const streamifier = require('streamifier');
const stripJs = require('strip-js');
var exphbs = require('express-handlebars');
var HTTP_PORT = process.env.PORT || 8080;

// Configure the view engine and handlebars helpers
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
    navLink: function(url, options) {
      return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function(lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
    safeHTML: function(context) {
      return stripJs(context);
    }
  }
}));
app.set('view engine', '.hbs');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Middleware to set activeRoute and viewingCategory
app.use(function(req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Redirect "/" route to "/blog" route
app.get('/', function (req, res) {
  res.redirect('/blog');
});

// Render the "about" view using the "about" template
app.get('/about', function (req, res) {
  res.render('about');
});

// Serve the addposts.html file from the views folder.
app.get('/posts/add', function(req, res) {
  res.render('addPost');
});

// upload variable without the disk storage
const upload = multer();
// Set the cloudinary config
cloudinary.config({
  cloud_name: 'dvejlsqre',
  api_key: '179383226592744',
  api_secret: 'tevSCedsCurSw4BtMZFNaxiMK58',
  secure: true,
});

// Add the route for adding a new post
app.post('/posts/add', upload.single('featureImage'), function (req, res) {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
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
        res.redirect('/posts');
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        res.status(500).send('Success');
      });
  } else {
    processPost('');
    res.redirect('/posts');
  }
  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;
    const postData = {
      // Extract the necessary fields from req.body and add postDate
      title: req.body.title,
      body: req.body.body,
      category: req.body.category,
      featureImage: req.body.featureImage,
      postDate: new Date().toISOString().split('T')[0], // Set postDate as current date (YYYY-MM-DD format)
    };
    blogService.addPost(postData)
      .then(() => {
        // Redirect to /posts after adding the post
        res.redirect('/posts');
      })
      .catch((error) => {
        console.error('Error adding post:', error);
        res.status(500).send('Error adding post');
      });
  }
});

// Initialize blog-service and start the server
blogService
  .initialize()
  .then(() => {
    // Route to get all published posts
    app.get('/blog', async (req, res) => {
      let viewData = {};

      try {
        let posts = [];
        if (req.query.category) {
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
        } else {
          posts = await blogService.getPublishedPosts();
        }
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        let post = posts[0];
        viewData.posts = posts;
        viewData.post = post;
      } catch (error) {
        viewData.message = "no results";
      }

      try {
        let categories = await blogService.getCategories();
        viewData.categories = categories;
      } catch (error) {
        viewData.categoriesMessage = "no results";
      }

      res.render("blog", { data: viewData });
    });
    // Handle category selection
    app.get('/blog/category/:id', function (req, res) {
      const categoryId = parseInt(req.params.id); // Get the value of the "id" parameter as an integer
      blogService.getPostsByCategory(categoryId)
        .then((posts) => {
          res.render('blog', { data: { posts, viewingCategory: categoryId } });
        })
        .catch((error) => {
          console.error(error);
          res.render('blog', { data: { message: 'no results' } });
        });
    });

    app.get('/posts', function(req, res) {
      blogService.getAllPosts()
        .then((data) => {
          if (data.length) {
            res.render('posts', { posts: data });
          } else {
            res.render('posts', { message: 'no results' });
          }
        })
        .catch((error) => {
          console.error(error);
          res.render('posts', { message: 'no results' });
        });
    });

    // Route to get a single post by ID
    app.get('/post/:id', function (req, res) {
      const postId = parseInt(req.params.id); // Get the value of the "id" parameter as an integer
      blogService
        .getPostById(postId)
        .then((post) => {
          if (post) {
            res.render('singlePost', { post }); // Render the "singlePost" view with the post data
          } else {
            res.status(404).render('404'); // Render the "404" view if the post is not found
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render('500'); // Render the "500" view for any errors
        });
    });

    // Route to get all categories
    app.get('/categories', function(req, res) {
      blogService.getCategories()
        .then((data) => {
          if (data.length) {
            res.render('categories', { categories: data });
          } else {
            res.render('categories', { message: 'no results' });
          }
        })
        .catch((error) => {
          console.error(error);
          res.render('categories', { message: 'no results' });
        });
    });

    // Route for unmatched routes
    app.get('*', function (req, res) {
      res.status(404).render('404'); // Render the "404" view for unmatched routes
    });

    // Start the server and listen on the specified port
    app.listen(HTTP_PORT, function () {
      console.log('Express http server listening on port ' + HTTP_PORT);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize blog-service:', error);
  });
