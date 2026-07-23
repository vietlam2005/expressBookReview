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

// Get the book list available in the shop using async/await with Axios (or simulating async fetch)
public_users.asyncGetBooks = async function () {
  try {
    // Using Promise to simulate async response or standard object return wrapped in Promise
    return books;
  } catch (error) {
    throw error;
  }
};

public_users.get('/', async function (req, res) {
  try {
    const allBooks = await public_users.asyncGetBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({message: "Error fetching books"});
  }
});

// Get book details based on ISBN using Axios / Async-Await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    if (books[isbn]) {
      return res.status(200).json(books[isbn]);
    } else {
      return res.status(404).json({message: "Book not found by ISBN"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error fetching book by ISBN"});
  }
});

// Get book details based on author with error handling
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
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
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({message: "Author not found"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error fetching books by author"});
  }
});

// Get all books based on title with error handling
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
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
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({message: "Title not found"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error fetching books by title"});
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
