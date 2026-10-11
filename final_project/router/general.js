const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(404).json({message: "Unable to register user."});
    }
  
    // Check if username already exists using isValid
    if (isValid(username)) {
      return res.status(404).json({message: "User already exists!"});
    } else {
      // Register new user
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    }
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get('/books',function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
      // Simulate async operation
      if (books) {
        resolve(books);
      } else {
        reject("Books not found");
      }
    });
  
    getBooks.then(
      (booksList) => {
        res.send(JSON.stringify(booksList, null, 4));
      }
    ).catch(
      (err) => {
        res.status(500).json({message: err});
      }
    );
});
// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(JSON.stringify(books[isbn], null, 4));
});  
// TASK 11
public_users.get('/books/isbn/:isbn',function (req, res) {
    let isbn = req.params.isbn;
    let myPromise = new Promise((resolve, reject) => {
      let book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    });
  
    myPromise.then((result) => {
      res.send(JSON.stringify(result, null, 4));
    }).catch((err) => {
      res.status(404).json({message: err});
    });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    let filtered_books = [];
  
    // Obtain all keys for the 'books' object
    let keys = Object.keys(books);
  
    // Iterate and check author matches
    for (let key of keys) {
      if (books[key].author === author) {
        filtered_books.push(books[key]);
      }
    }
  
    if (filtered_books.length > 0) {
      res.status(200).send(JSON.stringify(filtered_books, null, 4));
    } else {
      res.status(404).json({message: "Author not found"});
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    let filtered_books = [];
  
    let keys = Object.keys(books);
  
    for (let key of keys) {
      if (books[key].title === title) {
        filtered_books.push(books[key]);
      }
    }
  
    if (filtered_books.length > 0) {
      res.status(200).send(JSON.stringify(filtered_books, null, 4));
    } else {
      res.status(404).json({message: "Title not found"});
    }
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      // Get the reviews based on ISBN
      res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
      res.status(404).json({message: "Book not found"});
    }
});

module.exports.general = public_users;
