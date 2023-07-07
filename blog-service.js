const fs = require("fs");
const path = require("path");
const postsFile = path.join(__dirname, "data/posts.json");
const categoriesFile = path.join(__dirname, "data/categories.json");
let posts = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile(postsFile, "utf8", (err, data) => {
      if (err) {
        reject("Unable to read posts file");
      } else {
        try {
          posts = JSON.parse(data);
          fs.readFile(categoriesFile, "utf8", (err, data) => {
            if (err) {
              reject("Unable to read categories file");
            } else {
              try {
                categories = JSON.parse(data);
                resolve();
              } catch (error) {
                reject("Error parsing categories file");
              }
            }
          });
        } catch (error) {
          reject("Error parsing posts file");
        }
      }
    });
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length > 0) {
      resolve(posts);
    } else {
      reject("No results returned");
    }
  });
}

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter(post => post.published);
    if (publishedPosts.length > 0) {
      resolve(publishedPosts);
    } else {
      reject("No results returned");
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject("No results returned");
    }
  });
}

function addPost(postData) {
  return new Promise((resolve, reject) => {
    if (postData.published === undefined) {
      postData.published = false;
    } else {
      postData.published = true;
    }

    postData.id = posts.length + 1;

    // Set the postDate to the current date in the format "YYYY-MM-DD"
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10);
    postData.postDate = formattedDate;

    posts.push(postData);

    // Save the updated posts array to the file
    fs.writeFile(postsFile, JSON.stringify(posts), (err) => {
      if (err) {
        reject("Error writing to posts file");
      } else {
        resolve(postData);
      }
    });
  });
}


function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(post => post.category === category);
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("No results returned");
    }
  });
}

function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(post => new Date(post.postDate) >= new Date(minDateStr));
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("No results returned");
    }
  });
}

function getPostById(id) {
  return new Promise((resolve, reject) => {
    const post = posts.find(post => post.id === id);
    if (post) {
      resolve(post);
    } else {
      reject("No result returned");
    }
  });
}

function getPublishedPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter(post => post.published && post.category === category);
    if (publishedPosts.length > 0) {
      resolve(publishedPosts);
    } else {
      reject("No results returned");
    }
  });
}


module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory
};