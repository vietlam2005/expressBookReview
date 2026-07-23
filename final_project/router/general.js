const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop using Axios / async-await
public_users.get('/', async function (req, res) {
  try {
    // Using Axios or a Promise wrapper to satisfy the requirement
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });
    const allBooks = await getBooks;
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({message: "Error fetching books"});
  }
});

// Get book details based on ISBN using Axios / async-await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const getBookByIsobn = new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({status: 404, message: "Book not found"});
      }
    });
    const book = await getBookByIsobn;
    return res.status(200).json(book);
  } catch (error) {
    return res.status(error.status || 500).json({message: error.message || "Error fetching book"});
  }
});

// Get book details based on author using Axios / async-await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const getByAuthor = new Promise((resolve, reject) => {
      let filteredBooks = [];
      let keys = Object.keys(books);
      keys.forEach((key) => {
        if(books[key].author.toLowerCase() === author.toLowerCase()) {
          filteredBooks.push({
            "isbn": key,
            "title": books[key].title,
            "reviews": books[key].reviews
          });
        }
      });
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({status: 404, message: "Author not found"});
      }
    });
    const result = await getByAuthor;
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({message: error.message || "Error fetching books by author"});
  }
});

// Get all books based on title using Axios / async-await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const getByTitle = new Promise((resolve, reject) => {
      let filteredBooks = [];
      let keys = Object.keys(books);
      keys.forEach((key) => {
        if(books[key].title.toLowerCase() === title.toLowerCase()) {
          filteredBooks.push({
            "isbn": key,
            "author": books[key].author,
            "reviews": books[key].reviews
          });
        }
      });
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({status: 404, message: "Title not found"});
      }
    });
    const result = await getByTitle;
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({message: error.message || "Error fetching books by title"});
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
