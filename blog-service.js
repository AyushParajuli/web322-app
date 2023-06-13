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
    posts.push(postData);

    // Save the updated posts array to the file
    fs.writeFile(postsFile, JSON.stringify(posts), err => {
      if (err) {
        reject("Error writing to posts file");
      } else {
        resolve(postData);
      }
    });
  });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost
};
