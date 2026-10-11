const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  // Check if username exists
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  // Check if username and password match
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Save credentials for session as JWT
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let filtered_book = books[isbn];
  
    if (filtered_book) {
      let review = req.query.review;
      let username = req.session.authorization['username'];
  
      // If review exists for this user, modify it. If not, add it.
      if (filtered_book.reviews[username]) {
        filtered_book.reviews[username] = review;
        res.status(200).send(`The review for the book with ISBN ${isbn} has been updated.`);
      } else {
        filtered_book.reviews[username] = review;
        res.status(200).send(`The review for the book with ISBN ${isbn} has been added.`);
      }
    } else {
      res.status(404).json({message: `Book with ISBN ${isbn} not found`});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let username = req.session.authorization['username'];
    let filtered_book = books[isbn];
  
    if (filtered_book) {
      // Check if this user has posted a review
      if (filtered_book.reviews[username]) {
        delete filtered_book.reviews[username];
        return res.status(200).send(`Reviews for the book with ISBN ${isbn} deleted.`);
      } else {
        return res.status(404).json({message: `No review found for user ${username}`});
      }
    } else {
      return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;